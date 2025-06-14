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

  console.log('Fast PDF processor invoked');

  try {
    const { image, fileType } = JSON.parse(event.body);
    
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Remove base64 prefix and convert to buffer
    const base64Data = image.replace(/^data:application\/pdf;base64,/, '');
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    
    // Check file size (limit to 2MB for faster processing)
    const sizeMB = pdfBuffer.length / (1024 * 1024);
    console.log('PDF size:', sizeMB.toFixed(2), 'MB');
    
    if (sizeMB > 2) {
      throw new Error('PDF file too large. Please upload a file smaller than 2MB.');
    }

    // Extract text from PDF
    let textContent = '';
    try {
      const startTime = Date.now();
      const pdfData = await pdfParse(pdfBuffer, {
        max: 1 // Only parse first page to speed up
      });
      
      textContent = pdfData.text;
      console.log('Text extraction took:', Date.now() - startTime, 'ms');
      console.log('Extracted text length:', textContent.length);
      
      if (!textContent || textContent.trim().length < 50) {
        throw new Error('Could not extract readable text from PDF. Please try an image instead.');
      }
    } catch (err) {
      console.error('PDF parsing error:', err);
      throw new Error('Failed to read PDF. Please ensure it contains selectable text (not a scanned image).');
    }

    // Limit text to prevent token overflow and timeout
    const maxLength = 4000;
    if (textContent.length > maxLength) {
      console.log('Truncating text from', textContent.length, 'to', maxLength);
      textContent = textContent.substring(0, maxLength) + '\n\n[Content truncated for processing]';
    }

    // Create a focused prompt for faster processing
    const messages = [
      {
        role: "system",
        content: `You are a worksheet analyzer. Extract questions and return ONLY valid JSON.
        Required format:
        {
          "title": "worksheet title",
          "description": "one line description",
          "sections": [{
            "title": "section name",
            "instructions": "brief instructions",
            "questions": [{
              "type": "multiple-choice|matching|fill-blank",
              "text": "question text",
              "options": [{"id": "a", "text": "option"}],
              "correctAnswer": "answer"
            }]
          }]
        }
        Be concise. Extract the main content only.`
      },
      {
        role: "user",
        content: `Extract worksheet from this text. Return ONLY JSON:\n\n${textContent}`
      }
    ];

    // Call OpenAI with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

    let response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Use faster model
          messages: messages,
          temperature: 0.1,
          max_tokens: 2000 // Limit response size
        }),
        signal: controller.signal
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Processing timed out. Try a simpler PDF.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'AI processing failed');
    }

    // Parse response
    const aiResponse = data.choices[0].message.content;
    console.log('AI response length:', aiResponse.length);
    
    // Clean response
    let cleanedResponse = aiResponse.trim();
    if (cleanedResponse.includes('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    // Remove any text before the first {
    const jsonStart = cleanedResponse.indexOf('{');
    if (jsonStart > 0) {
      cleanedResponse = cleanedResponse.substring(jsonStart);
    }
    
    let parsedWorksheet;
    try {
      parsedWorksheet = JSON.parse(cleanedResponse);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr);
      console.error('Raw response:', cleanedResponse);
      throw new Error('Failed to parse AI response. Please try again.');
    }

    // Add UUIDs
    const crypto = require('crypto');
    const uuidv4 = () => crypto.randomUUID();
    
    const processedWorksheet = {
      ...parsedWorksheet,
      id: uuidv4(),
      sections: (parsedWorksheet.sections || []).map(section => ({
        ...section,
        id: uuidv4(),
        questions: (section.questions || []).map(question => ({
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
    console.error('Error in fast PDF processor:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Failed to process PDF',
        tip: 'For best results, use PDFs with selectable text (not scanned images)'
      })
    };
  }
};