import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckDuplicateRequest {
  fileName: string;
  fileType: string;
  courseName: string;
  department: string;
  description?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileType, courseName, department, description }: CheckDuplicateRequest = await req.json();
    
    console.log("Checking for duplicates:", { fileName, fileType, courseName, department });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Search for similar materials in the database
    const { data: existingMaterials, error: dbError } = await supabase
      .from("materials")
      .select("id, title, file_name, course_name, department, description, file_type, created_at")
      .eq("department", department)
      .or(`course_name.ilike.%${courseName}%,file_name.ilike.%${fileName}%`);

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    // If no similar materials found, allow upload
    if (!existingMaterials || existingMaterials.length === 0) {
      return new Response(
        JSON.stringify({
          isDuplicate: false,
          message: "No similar materials found. You can proceed with the upload.",
          similarMaterials: [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use Gemini AI to analyze if these are truly duplicates
    const aiPrompt = `You are a smart duplicate detection system for an academic material platform. 

I'm about to upload a file with these details:
- File Name: ${fileName}
- File Type: ${fileType}
- Course Name: ${courseName}
- Department: ${department}
- Description: ${description || "No description provided"}

I found these existing materials in the database:
${existingMaterials.map((m, i) => `
${i + 1}. Title: ${m.title}
   File Name: ${m.file_name}
   Course: ${m.course_name}
   Type: ${m.file_type}
   Description: ${m.description || "No description"}
   Uploaded: ${new Date(m.created_at).toLocaleDateString()}
`).join("\n")}

Analyze if the new file is likely a duplicate of any existing material. Consider:
- Similar file names (but account for different versions, chapters, or years)
- Same course and department
- Similar descriptions
- File types

Respond in JSON format:
{
  "isDuplicate": true/false,
  "confidence": "high"/"medium"/"low",
  "reason": "Brief explanation why this might be a duplicate or not",
  "similarMaterialIds": [array of IDs that are most similar]
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a duplicate detection expert. Always respond with valid JSON only, no markdown formatting."
          },
          {
            role: "user",
            content: aiPrompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      // Fallback: just return the similar materials without AI analysis
      return new Response(
        JSON.stringify({
          isDuplicate: true,
          confidence: "low",
          reason: "AI analysis unavailable. Found similar materials based on name and course.",
          similarMaterials: existingMaterials.slice(0, 5),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiData = await aiResponse.json();
    const aiAnalysis = JSON.parse(aiData.choices[0].message.content);

    console.log("AI Analysis:", aiAnalysis);

    // Get the detailed info for similar materials identified by AI
    const similarMaterials = existingMaterials.filter(m => 
      aiAnalysis.similarMaterialIds?.includes(m.id)
    );

    return new Response(
      JSON.stringify({
        isDuplicate: aiAnalysis.isDuplicate,
        confidence: aiAnalysis.confidence,
        reason: aiAnalysis.reason,
        similarMaterials: similarMaterials.length > 0 ? similarMaterials : existingMaterials.slice(0, 3),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error in check-duplicate-material function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isDuplicate: false,
        similarMaterials: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
