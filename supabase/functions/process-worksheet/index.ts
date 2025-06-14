
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0'

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { image } = await req.json()

    // Call OpenAI Vision API to analyze the worksheet
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
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
        ]
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
