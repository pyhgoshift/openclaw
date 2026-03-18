interface MoltbotEnv {
  OPENAI_API_KEY?: string;
  GOOGLE_AI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  MASTER_STORAGE?: R2Bucket;
  DISCORD_BOT_TOKEN?: string;
  DISCORD_PUBLIC_KEY?: string;
  DISCORD_APPLICATION_ID?: string;
  ASSETS?: Fetcher;
}

export class SandboxManager {
  state: any;
  env: MoltbotEnv;
  constructor(state: any, env: MoltbotEnv) { this.state = state; this.env = env; }
  async fetch(request: Request) { return new Response("Active"); }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request: Request, env: MoltbotEnv) {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const url = new URL(request.url);

    // ✅ /deepflow/* → DeerFlow 프론트엔드 Pages로 전달
    // (Note: pyhgoshift.com/deepflow 로 올 경우에만 여기서 가로채고, 
    // www.pyhgoshift.com/deepflow 는 wrangler.jsonc 설정에 의해 Pages가 직접 처리함)
    if (url.pathname.startsWith("/deepflow")) {
      return fetch(
        new URL(url.pathname + url.search, "https://deerflow-frontend.pages.dev").toString(),
        request
      );
    }

    // ✅ /engine/* → pyhgoshift-engine 내부 핸들러로 전달 (/engine 접두사 제거)
    // (www.pyhgoshift.com/engine* 라우트 가로채기 포함)
    if (url.pathname.startsWith("/engine")) {
      const strippedPath = url.pathname.replace(/^\/engine/, "") || "/";
      const internalUrl = new URL(request.url);
      internalUrl.pathname = strippedPath;
      const internalRequest = new Request(internalUrl.toString(), request);
      return handleEngine(internalRequest, env);
    }

    return handleEngine(request, env);
  }
};

async function handleEngine(request: Request, env: MoltbotEnv): Promise<Response> {
    const url = new URL(request.url);

    // --- DISCORD VERIFICATION UTILITY ---
    const verifyDiscordSignature = async (request: Request, publicKey: string) => {
      const signature = request.headers.get("x-signature-ed25519");
      const timestamp = request.headers.get("x-signature-timestamp");
      if (!signature || !timestamp) return false;

      const body = await request.clone().text();
      const message = new TextEncoder().encode(timestamp + body);
      const signatureBin = new Uint8Array(signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      const publicKeyBin = new Uint8Array(publicKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

      try {
        const cryptoKey = await crypto.subtle.importKey(
          "raw",
          publicKeyBin,
          { name: "NODE-ED25519", namedCurve: "NODE-ED25519" } as any,
          false,
          ["verify"]
        );
        return await crypto.subtle.verify(
          { name: "NODE-ED25519" } as any,
          cryptoKey,
          signatureBin,
          message
        );
      } catch (e) {
        return false;
      }
    };

    // /api/discord 엔드포인트
    if (url.pathname === "/api/discord") {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
      const publicKey = env.DISCORD_PUBLIC_KEY;
      if (!publicKey) return new Response("Discord configuration missing", { status: 500 });
      const isValid = await verifyDiscordSignature(request, publicKey);
      if (!isValid) return new Response("Invalid request signature", { status: 401 });

      const interaction = await request.json() as any;
      if (interaction.type === 1) {
        return new Response(JSON.stringify({ type: 1 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (interaction.type === 2) {
        const { name, options } = interaction.data;
        const subCommand = options?.[0];
        const userQuestion = subCommand?.name === "question" ? subCommand.value : options?.[0]?.value;

        if (name === "ask") {
          const interactionToken = interaction.token;
          const appId = env.DISCORD_APPLICATION_ID;
          const processDiscordAsk = async () => {
             try {
                const aiResponse = await fetch(`${url.origin}/ask`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ question: userQuestion })
                });
                const data: any = await aiResponse.json();
                const answer = data.response;
                await fetch(`https://discord.com/api/v10/webhooks/${appId}/${interactionToken}/messages/@original`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ content: `**지휘관님의 질문:** ${userQuestion}\n\n${answer}` })
                });
             } catch (err) {
                console.error("Discord Follow-up Error:", err);
             }
          };
          (globalThis as any).ctx?.waitUntil?.(processDiscordAsk());
          if (!(globalThis as any).ctx) processDiscordAsk();
          return new Response(JSON.stringify({
            type: 4,
            data: { content: "🛰️ **전략 분석 엔진 가동 중...** 지휘관님, 잠시만 기다려 주십시오." }
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
      return new Response(JSON.stringify({ type: 1 }), { headers: corsHeaders });
    }

    // /api/health 체크 엔드포인트
    if (url.pathname === "/api/health") {
      const keys = Object.keys(env) as Array<keyof MoltbotEnv>;
      const keyInfo = keys.map(k => `${String(k)}(${((env[k] as any)?.length || 'n/a')})`).join(", ");
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
        const body: any = await request.json();
        const question = body.question;
        const requestedModel = body.model || "moonshotai/kimi-k2.5";
        const c = {
          json: (data: any, status = 200) => new Response(JSON.stringify(data), {
            status,
            headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
          })
        };

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

        let contextKnowledge = "마스터 저장소 데이터가 없습니다.";
        if (env.MASTER_STORAGE) {
          try {
            const list = await env.MASTER_STORAGE.list({ limit: 5, prefix: 'raw/' });
            if (list.objects.length > 0) {
              const contents = await Promise.all(list.objects.map(async (obj: any) => {
                const file = await env.MASTER_STORAGE!.get(obj.key);
                if (!file) return `- [${obj.uploaded.toISOString()}] (File Error)`;
                const text = await file.text();
                return `- [${obj.uploaded.toISOString()}] ${text.substring(0, 200)}...`;
              }));
              contextKnowledge = "마스터 저장소 데이터:\n" + contents.join("\n");
            }
          } catch (err: any) {
            contextKnowledge = `저장소 조회 오류: ${err.message}`;
          }
        }

        const systemPrompt = `# ROLE: Stratagem Engine for Commander Park (파리고시프트 전략 엔진)
## THE SEVEN PARKS & SPECIALIST POOL
귀하는 지휘관 파크를 보좌하는 통합 AI 시스템입니다. 답변 시 다음 전문가들의 지식을 요약하여 반영하십시오:
- @Blueprint: 구조 설계 및 청사진 담당
- @CodeGen: 실제 구현 및 로직 최적화
- @Reflector: 비판적 검토 및 리스크 분석
- @Guardian: 보안 및 안정성 검증
- @DataMiner: 데이터 추출 및 분석

## PHILOSOPHY
1. ANALYSIS-STRATEGY-EXECUTION 3단 구조 준수.
2. 각 단계에서 관련 전문가(@Expert)의 소견을 짧게 포함할 것.
3. NO FLATTERY: 감정적 사족 제거. 명확한 지시만 수행.
4. FORMATTING: 가독성 위해 80자 내외 줄바꿈.

## RETRIEVED KNOWLEDGE (RAG)
${contextKnowledge}`;

        let response;
        if (env.GOOGLE_AI_API_KEY && (requestedModel === "gemini" || requestedModel.includes("gemini"))) {
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
          const baseUrl = "https://integrate.api.nvidia.com/v1";
          const apiKey = (env.OPENAI_API_KEY || "").trim();
          let modelConfig: any = {
            model: requestedModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: question }
            ],
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 4096,
            stream: false
          };
          if (requestedModel.includes("qwen")) {
            modelConfig.temperature = 0.6;
            modelConfig.top_p = 0.95;
          } else if (requestedModel.includes("deepseek")) {
            modelConfig.temperature = 0.6;
            modelConfig.stream = true;
          } else if (requestedModel.includes("kimi")) {
            modelConfig.max_tokens = 8192;
          }

          const nimRes = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(modelConfig)
          });

          if (modelConfig.stream && nimRes.body) {
            if (!nimRes.ok) {
              const errText = await nimRes.text();
              return c.json({ response: `엔진 응답 에러 (${nimRes.status}): ${errText.substring(0, 200)}` }, nimRes.status);
            }
            const reader = nimRes.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = "";
            let fullReasoning = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");
              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const raw = line.slice(6).trim();
                if (raw === "[DONE]") break;
                try {
                  const parsed = JSON.parse(raw);
                  const delta = parsed.choices?.[0]?.delta;
                  if (delta?.content) fullContent += delta.content;
                  if (delta?.reasoning_content) fullReasoning += delta.reasoning_content;
                } catch { }
              }
            }
            const finalAnswer = fullReasoning
              ? `[THINKING]\n${fullReasoning}\n\n[RESPONSE]\n${fullContent}`
              : fullContent || "응답을 생성하지 못했습니다.";
            return c.json({ response: finalAnswer });
          }
          response = nimRes;
        } else {
          return c.json({ response: "사용 가능한 AI 엔진 키가 없습니다." }, 500);
        }

        if (!response.ok) {
          const errorDetail = await response.text();
          return c.json({ response: `엔진 응답 에러 (${response.status}): ${errorDetail.substring(0, 200)}` }, response.status);
        }

        const data: any = await response.json();
        let answer = "";
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          answer = data.candidates[0].content.parts[0].text;
        } else if (data.choices?.[0]?.message) {
          const msg = data.choices[0].message;
          const reasoning = msg.reasoning_content || "";
          const content = msg.content || "";
          answer = reasoning ? `[THINKING]\n${reasoning}\n\n[RESPONSE]\n${content}` : content;
        } else if (data.content?.[0]?.text) {
          answer = data.content[0].text;
        } else {
          answer = "응답 형식을 해석할 수 없습니다.";
        }
        return c.json({ response: answer });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("PyhgoShift Engine Running (No Assets)", { headers: corsHeaders });
}