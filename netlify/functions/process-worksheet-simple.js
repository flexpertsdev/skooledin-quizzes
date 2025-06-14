exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  console.log('Simple PDF processor invoked');

  try {
    const { image, fileType } = JSON.parse(event.body);
    
    // For now, return a mock response to test the connection
    const mockWorksheet = {
      id: "pdf-" + Date.now(),
      title: "PDF Worksheet (Processing Test)",
      description: "This is a test response while we debug PDF processing",
      sections: [{
        id: "section-1",
        title: "Test Section",
        instructions: "This is a test to verify the function works",
        questions: [{
          id: "q1",
          type: "multiple-choice",
          text: "Is the PDF processing working?",
          options: [
            { id: "a", text: "Yes, it's working!" },
            { id: "b", text: "No, still having issues" }
          ],
          correctAnswer: "a"
        }]
      }]
    };

    // Add a small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ worksheet: mockWorksheet })
    };

  } catch (error) {
    console.error('Error in simple processor:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Processing failed',
        details: 'Simple processor error'
      })
    };
  }
};