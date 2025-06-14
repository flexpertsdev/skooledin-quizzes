const pdf2pic = require('pdf2pic');
const pdfParse = require('pdf-parse');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  console.log('PDF processor invoked');

  try {
    const { image, fileType } = JSON.parse(event.body);
    
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Remove base64 prefix
    const base64Data = image.replace(/^data:application\/pdf;base64,/, '');
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    
    // Check file size (limit to 5MB)
    if (pdfBuffer.length > 5 * 1024 * 1024) {
      throw new Error('PDF file too large. Please upload a file smaller than 5MB.');
    }

    console.log('PDF size:', (pdfBuffer.length / 1024 / 1024).toFixed(2), 'MB');

    // Try text extraction first (fast)
    let textContent = '';
    try {
      const pdfData = await pdfParse(pdfBuffer);
      textContent = pdfData.text;
      console.log('Extracted text length:', textContent.length);
    } catch (err) {
      console.log('Text extraction failed, will use image conversion');
    }

    let openAIMessages;

    // If we have good text content, use it
    if (textContent && textContent.trim().length > 100) {
      // Limit text to prevent token overflow
      if (textContent.length > 6000) {
        textContent = textContent.substring(0, 6000) + '... [truncated]';
      }

      openAIMessages = [
        {
          role: "system",
          content: `You are a specialized AI trained to analyze educational worksheets. 
          Extract and return the data in this exact JSON format:
          {
            "title": "worksheet title",
            "description": "brief description",
            "sections": [{
              "title": "section title",
              "instructions": "section instructions",
              "questions": [{
                "type": "multiple-choice|matching|fill-blank",
                "text": "question text",
                "options": [{"id": "a", "text": "option text"}],
                "correctAnswer": "correct answer or option id"
              }]
            }]
          }`
        },
        {
          role: "user",
          content: `Extract worksheet information from this text:\n\n${textContent}`
        }
      ];
    } else {
      // If text extraction failed or is too short, convert first page to image
      const options = {
        density: 100,
        saveFilename: "page",
        savePath: "/tmp",
        format: "png",
        width: 1024,
        height: 1024
      };

      const convert = pdf2pic.fromBuffer(pdfBuffer, options);
      const pageImage = await convert(1); // Convert first page only
      
      // Convert to base64
      const imageBase64 = `data:image/png;base64,${pageImage.base64}`;

      openAIMessages = [
        {
          role: "system",
          content: `You are a specialized AI trained to analyze educational worksheets. 
          Extract ALL questions and content from this worksheet image.
          Return the data in this exact JSON format:
          {
            "title": "worksheet title",
            "description": "brief description",
            "sections": [{
              "title": "section title",
              "instructions": "section instructions",
              "questions": [{
                "type": "multiple-choice|matching|fill-blank",
                "text": "question text",
                "options": [{"id": "a", "text": "option text"}],
                "correctAnswer": "correct answer or option id"
              }]
            }]
          }`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all worksheet content from this PDF page image."
            },
            {
              type: "image_url",
              image_url: { url: imageBase64 }
            }
          ]
        }
      ];
    }

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: textContent ? "gpt-4o" : "gpt-4o",
        messages: openAIMessages,
        temperature: 0.1,
        max_tokens: 4000
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'Failed to process worksheet');
    }

    // Parse response
    const aiResponse = data.choices[0].message.content;
    let cleanedResponse = aiResponse;
    if (cleanedResponse.includes('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    const parsedWorksheet = JSON.parse(cleanedResponse);

    // Add UUIDs
    const crypto = require('crypto');
    const uuidv4 = () => crypto.randomUUID();
    
    const processedWorksheet = {
      ...parsedWorksheet,
      id: uuidv4(),
      sections: parsedWorksheet.sections.map(section => ({
        ...section,
        id: uuidv4(),
        questions: section.questions.map(question => ({
          ...question,
          id: uuidv4(),
          options: question.options?.map((opt, index) => ({
            ...opt,
            id: opt.id || String.fromCharCode(97 + index)
          }))
        }))
      }))
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ worksheet: processedWorksheet })
    };

  } catch (error) {
    console.error('Error processing PDF:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Failed to process PDF'
      })
    };
  }
};