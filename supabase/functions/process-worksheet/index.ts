import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0'
import { getDocument } from 'https://esm.sh/pdfjs-dist@3.11.174'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Question {
  id: string;
  type: string;
  text: string;
  options?: { id: string; text: string; }[];
  correctAnswer: string | string[];
}

interface WorksheetSection {
  id: string;
  title: string;
  instructions: string;
  questions: Question[];
}

async function extractTextFromPDF(base64Pdf: string): Promise<string> {
  try {
    // Remove the data:application/pdf;base64, prefix if present
    const base64Data = base64Pdf.replace(/^data:application\/pdf;base64,/, '');
    
    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Load the PDF document
    const loadingTask = getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const numPages = pdf.numPages;
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { image, fileType } = await req.json()

    let openAIMessages;

    // Check if it's a PDF or image
    if (fileType === 'application/pdf' || image.startsWith('data:application/pdf')) {
      // Extract text from PDF
      const pdfText = await extractTextFromPDF(image);
      
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
          }`
        },
        {
          role: "user",
          content: `Analyze this worksheet text and convert it into the specified JSON format. Identify the type of each question (multiple-choice, fill-in-the-blank, or matching). For multiple choice and matching questions, provide options with IDs.

Worksheet content:
${pdfText}`
        }
      ];
    } else {
      // Use vision API for images
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
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: fileType === 'application/pdf' || image.startsWith('data:application/pdf') ? "gpt-4o" : "gpt-4o",
        messages: openAIMessages,
        temperature: 0.1,
        max_tokens: 4000
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('OpenAI API error:', data)
      throw new Error(data.error?.message || 'Failed to process worksheet')
    }

    // Parse OpenAI's response
    const aiResponse = data.choices[0].message.content
    console.log('AI Response:', aiResponse)

    try {
      // Parse the JSON response from OpenAI
      const parsedWorksheet = JSON.parse(aiResponse)

      // Add UUIDs to sections and questions
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
      }

      return new Response(
        JSON.stringify({ worksheet: processedWorksheet }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      throw new Error('Failed to parse AI response into worksheet format')
    }

  } catch (error) {
    console.error('Error processing worksheet:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})