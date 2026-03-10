export class SandboxManager {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(request) { return new Response("Active"); }
}

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const url = new URL(request.url);

    // /api/health 체크 엔드포인트 (멀티 모델 정보 포함)
    if (url.pathname === "/api/health") {
      const keys = Object.keys(env);
      const keyInfo = keys.map(k => `${k}(${(env[k]?.length || 'n/a')})`).join(", ");

      const supportedModels = [
        "moonshotai/kimi-k2.5",
        "qwen/qwen3.5-397b-a17b",
        "deepseek-ai/deepseek-v3.2"
      ];

      let activeEngine = "NONE";
      const apiKey = (env.OPENAI_API_KEY || "").trim();
      if (env.GOOGLE_AI_API_KEY) activeEngine = "GEMINI";
      else if (apiKey) activeEngine = "NVIDIA NIM (MULTI)";
      else if (env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY !== 'placeholder') activeEngine = "ANTHROPIC";

      const statusMsg = `PyhgoShift v9.0-BETA | Engine: ${activeEngine} | Models: [${supportedModels.join(", ")}] | Bindings: [${keyInfo}]`;
      return new Response(statusMsg, { headers: corsHeaders });
    }

    if (url.pathname === "/ask") {
      try {
        const body = await request.json();
        const question = body.question;
        const requestedModel = body.model || "moonshotai/kimi-k2.5";

        const c = {
          json: (data, status = 200) => new Response(JSON.stringify(data), {
            status,
            headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
          })
        };

        // [Phase 1] Intent Detection & RAG Logic
        let isStorageCommand = false;
        if ((question.includes('저장') || question.includes('학습')) &&
          !question.includes('보고') && !question.includes('요약') && !question.includes('확인') && !question.includes('알려')) {
          isStorageCommand = true;
        }

        if (isStorageCommand) {
          if (env.MASTER_STORAGE) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            await env.MASTER_STORAGE.put(`raw/${timestamp}.txt`, question);
            return c.json({ response: "지휘관님, 해당 지식이 마스터 저장소(R2)에 영구 보존되었습니다." });
          } else {
            return c.json({ response: "오류: 마스터 저장소가 연결되지 않았습니다." });
          }
        }

        // [Phase 2] RAG Retrieval
        let contextKnowledge = "마스터 저장소 데이터가 없습니다.";
        if (env.MASTER_STORAGE) {
          try {
            const list = await env.MASTER_STORAGE.list({ limit: 5, prefix: 'raw/' });
            if (list.objects.length > 0) {
              const contents = await Promise.all(list.objects.map(async (obj) => {
                const file = await env.MASTER_STORAGE.get(obj.key);
                const text = await file.text();
                return `- [${obj.uploaded.toISOString()}] ${text.substring(0, 200)}...`;
              }));
              contextKnowledge = "마스터 저장소 데이터:\n" + contents.join("\n");
            }
          } catch (err) {
            contextKnowledge = `저장소 조회 오류: ${err.message}`;
          }
        }

        const systemPrompt = `# ROLE: Stratagem Engine for Commander Park (파리고시프트 전략 엔진)
## PHILOSOPHY
1. ANALYSIS-STRATEGY-EXECUTION 3단 구조 준수.
2. NO FLATTERY: 감정적 사족 제거.
3. DIRECTIVE FORCE: 명확한 지시.
4. FORMATTING: 가독성 위해 80자 내외 줄바꿈.
## RETRIEVED KNOWLEDGE (RAG)
${contextKnowledge}`;

        // [Phase 3] Multi-Engine Selection Logic
        let response;
        if (env.GOOGLE_AI_API_KEY && requestedModel === "gemini") {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${env.GOOGLE_AI_API_KEY}`;
          response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents: [{ parts: [{ text: "질문: " + question }] }]
            })
          });
        } else if ((env.OPENAI_API_KEY || "").trim()) {
          // NVIDIA NIM Optimized (Dynamic Logic)
          const baseUrl = "https://integrate.api.nvidia.com/v1";
          const apiKey = (env.OPENAI_API_KEY || "").trim();

          let modelConfig: any = {
            model: requestedModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: question }
            ],
            temperature: 1.0,
            top_p: 1.0,
            max_tokens: 16384,
            chat_template_kwargs: { thinking: true } as any
          };

          // Override for specific models
          if (requestedModel.includes("qwen")) {
            modelConfig.temperature = 0.6;
            modelConfig.top_p = 0.95;
            modelConfig.chat_template_kwargs = { enable_thinking: true };
          } else if (requestedModel.includes("deepseek")) {
            modelConfig.max_tokens = 8192;
            modelConfig.top_p = 0.95;
            modelConfig.chat_template_kwargs = { thinking: true };
          }

          response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(modelConfig)
          });
        } else {
          return c.json({ response: "사용 가능한 AI 엔진 키가 없습니다. (OPENAI_API_KEY 등 부재)" }, 500);
        }

        if (!response.ok) {
          const errorDetail = await response.text();
          return c.json({ response: `엔진 응답 에러 (${response.status}): ${errorDetail.substring(0, 200)}` }, response.status);
        }

        const data = await response.json();
        let answer = "";

        // Dynamic Parsing
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          answer = data.candidates[0].content.parts[0].text;
        } else if (data.choices?.[0]?.message) {
          const msg = data.choices[0].message;
          // Support Reasoning Content if available
          const reasoning = msg.reasoning_content || "";
          const content = msg.content || "";
          answer = reasoning ? `[THINKING]\n${reasoning}\n\n[RESPONSE]\n${content}` : content;
        } else if (data.content?.[0]?.text) {
          answer = data.content[0].text;
        } else {
          answer = "응답 형식을 해석할 수 없습니다.";
        }

        return c.json({ response: answer });

      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("PyhgoShift Engine Running (No Assets)", { headers: corsHeaders });
  }
};