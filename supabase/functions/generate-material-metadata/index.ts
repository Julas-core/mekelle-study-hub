// @ts-ignore: Deno serve is valid in Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, department, fileContent } = await req.json();
    // @ts-ignore: Deno.env is valid in Supabase Edge Functions
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build messages array with file content if available
    const messages: any[] = [
      { 
        role: 'system', 
        content: 'You are a helpful assistant that analyzes educational materials and generates metadata. Always respond with valid JSON only.' 
      }
    ];

    let prompt = '';
    
    if (fileContent) {
      // If we have file content, use it for better analysis
      prompt = `Analyze this educational material file and generate accurate metadata based on its actual content.

File name: "${fileName}"
Department context: ${department}

File content preview:
${fileContent.substring(0, 3000)}

Based on the ACTUAL CONTENT above, generate:
1. The course code (e.g., CSEN301, MATH201): Extract from the content if present, otherwise use "EDITME001" as placeholder
2. A clear, descriptive title (max 100 characters) that reflects the actual content
3. A brief description (max 200 characters) summarizing what this material actually contains

Respond in JSON format only:
{
  "courseCode": "extracted or placeholder course code",
  "title": "content-based title",
  "description": "summary of actual content"
}`;
    } else {
      // Fallback to filename-based analysis
      prompt = `Given a file named "${fileName}" for a ${department} department, analyze the filename and generate:
1. The course code (e.g., CSEN301, MATH201): If present in filename, use that. Otherwise, generate placeholder "EDITME001"
2. A clear, concise title (max 100 characters)
3. A brief description (max 200 characters) of what this material likely contains

Respond in JSON format:
{
  "courseCode": "course code from filename or placeholder",
  "title": "your generated title",
  "description": "your generated description"
}`;
    }

    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const metadata = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(metadata), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-material-metadata:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
