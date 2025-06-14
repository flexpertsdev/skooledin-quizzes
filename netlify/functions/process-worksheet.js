const pdfParse = require('pdf-parse');

exports.handler = async (event, context) => {
  // Extend function timeout
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  console.log('Function invoked, method:', event.httpMethod);

  try {
    const { image, fileType } = JSON.parse(event.body);
    console.log('Processing file type:', fileType);
    
    // Get OpenAI API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    let openAIMessages;

    // Check if it's a PDF
    if (fileType === 'application/pdf' || image.startsWith('data:application/pdf')) {
      console.log('Processing PDF file');
      
      // Extract text from PDF
      const base64Data = image.replace(/^data:application\/pdf;base64,/, '');
      const pdfBuffer = Buffer.from(base64Data, 'base64');
      
      try {
        const data = await pdfParse(pdfBuffer);
        let pdfText = data.text;
        
        console.log('PDF text extracted, length:', pdfText.length);
        
        // Limit text length to prevent token overflow
        if (pdfText.length > 8000) {
          console.log('PDF text too long, truncating to 8000 characters');
          pdfText = pdfText.substring(0, 8000) + '... [truncated]';
        }
        
        // Use text-based prompt for PDF content
        openAIMessages = [
          {
            role: "system",
            content: `You are a specialized AI trained to analyze educational worksheets and convert them into structured digital formats. 
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
                  "options": [{"id": "a", "text": "option text"}] (for multiple-choice/matching only),
                  "correctAnswer": "correct answer or option id"
                }]
              }]
            }
            
            IMPORTANT: 
            - For multiple choice questions, include all options with IDs (a, b, c, etc.)
            - For fill-in-the-blank questions, the correctAnswer should be the word/phrase that fills the blank
            - For matching questions, include the items to match as options
            - If the text seems disorganized, try to infer the structure from context`
          },
          {
            role: "user",
            content: `Analyze this worksheet text and convert it into the specified JSON format. The text was extracted from a PDF, so formatting might be imperfect. Use your best judgment to reconstruct the worksheet structure.

Worksheet content:
${pdfText}`
          }
        ];
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        throw new Error('Failed to extract text from PDF. The file might be corrupted or password-protected.');
      }
    } else {
      // Use vision API for images
      console.log('Processing image file');
      openAIMessages = [
        {
          role: "system",
          content: `You are a specialized AI trained to analyze educational worksheets and convert them into structured digital formats. 
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
                "options": [{"id": "a", "text": "option text"}] (for multiple-choice/matching only),
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
              text: "Analyze this worksheet and convert it into the specified JSON format. Identify the type of each question (multiple-choice, fill-in-the-blank, or matching). For multiple choice and matching questions, provide options with IDs."
            },
            {
              type: "image_url",
              image_url: {
                url: image
              }
            }
          ]
        }
      ];
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: fileType === 'application/pdf' ? "gpt-4o" : "gpt-4o",
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

    // Parse OpenAI's response
    const aiResponse = data.choices[0].message.content;
    console.log('AI Response received, length:', aiResponse.length);

    try {
      // Clean the response - sometimes GPT adds markdown code blocks
      let cleanedResponse = aiResponse;
      if (cleanedResponse.includes('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      // Parse the JSON response from OpenAI
      const parsedWorksheet = JSON.parse(cleanedResponse);

      // Add UUIDs to sections and questions
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
            // Ensure options have IDs if they don't already
            options: question.options?.map((opt, index) => ({
              ...opt,
              id: opt.id || String.fromCharCode(97 + index) // a, b, c, etc.
            }))
          }))
        }))
      };

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ worksheet: processedWorksheet })
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw AI response:', aiResponse);
      throw new Error('Failed to parse AI response into worksheet format');
    }

  } catch (error) {
    console.error('Error processing worksheet:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};