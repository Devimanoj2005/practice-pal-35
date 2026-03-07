import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, messages, config, transcript } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "interview") {
      // Real-time interview conversation
      systemPrompt = `You are an expert AI interviewer conducting a ${config.level} ${config.role} interview.
Tech stack focus: ${(config.techStack || []).join(", ")}.
Total questions to ask: ${config.questionCount}.

RULES:
- Ask one question at a time
- After the candidate answers, briefly analyze their response (1-2 sentences of feedback/correction if needed)
- Then ask the next question OR a follow-up if their answer was incomplete or incorrect
- Be encouraging but honest about mistakes
- Adapt difficulty based on candidate's performance
- Keep responses concise (under 100 words) so they sound natural when spoken aloud
- If the candidate's answer is wrong, gently correct them and explain briefly
- Track which question number you're on

Start by greeting the candidate warmly, then ask them to introduce themselves briefly (name, current role/experience, and why they're interested in this position). After they introduce themselves, proceed with the technical questions.`;

      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages,
            ],
          }),
        }
      );

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limited. Please try again shortly." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (status === 402) {
          return new Response(
            JSON.stringify({ error: "Credits exhausted. Please add credits." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const t = await response.text();
        console.error("AI gateway error:", status, t);
        throw new Error(`AI gateway error: ${status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ response: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "feedback") {
      // Generate comprehensive feedback from transcript
      systemPrompt = `You are an expert interview coach analyzing a mock interview transcript.`;

      userPrompt = `Analyze this ${config.role} (${config.level}) interview transcript and provide a comprehensive performance review.

Transcript:
${transcript.map((m: { speaker: string; text: string }) => `${m.speaker}: ${m.text}`).join("\n")}

You MUST respond using the suggest_feedback tool.`;

      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "suggest_feedback",
                  description: "Return structured interview feedback",
                  parameters: {
                    type: "object",
                    properties: {
                      overall_score: { type: "number", description: "Overall score 0-100" },
                      technical_score: { type: "number", description: "Technical knowledge score 0-100" },
                      communication_score: { type: "number", description: "Communication score 0-100" },
                      confidence_score: { type: "number", description: "Confidence score 0-100" },
                      problem_solving_score: { type: "number", description: "Problem solving score 0-100" },
                      clarity_score: { type: "number", description: "Clarity score 0-100" },
                      depth_score: { type: "number", description: "Depth of knowledge score 0-100" },
                      strengths: {
                        type: "array",
                        items: { type: "string" },
                        description: "3-5 specific strengths observed",
                      },
                      weaknesses: {
                        type: "array",
                        items: { type: "string" },
                        description: "3-5 areas for improvement",
                      },
                      suggestions: {
                        type: "array",
                        items: { type: "string" },
                        description: "4-6 actionable practice suggestions",
                      },
                      question_scores: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            question: { type: "string" },
                            score: { type: "number" },
                          },
                          required: ["question", "score"],
                          additionalProperties: false,
                        },
                        description: "Score for each question answered",
                      },
                      summary: { type: "string", description: "2-3 sentence overall summary" },
                    },
                    required: [
                      "overall_score",
                      "technical_score",
                      "communication_score",
                      "confidence_score",
                      "problem_solving_score",
                      "clarity_score",
                      "depth_score",
                      "strengths",
                      "weaknesses",
                      "suggestions",
                      "question_scores",
                      "summary",
                    ],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "suggest_feedback" } },
          }),
        }
      );

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limited. Please try again shortly." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (status === 402) {
          return new Response(
            JSON.stringify({ error: "Credits exhausted. Please add credits." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const t = await response.text();
        console.error("AI gateway error:", status, t);
        throw new Error(`AI gateway error: ${status}`);
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const feedback = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify({ feedback }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error("No structured feedback received from AI");
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-interview error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
