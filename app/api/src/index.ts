export class SandboxContainer {
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

    if (new URL(request.url).pathname === "/ask") {
      try {
        const { question } = await request.json();

        // Helper function to create JSON responses with CORS headers
        const c = {
          json: (data, status = 200) => new Response(JSON.stringify(data), {
            status,
            headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
          })
        };

        // [Phase 2] Intent Detection & RAG Logic
        let isStorageCommand = false;
        // 키워드가 있더라도 '보고', '요약', '확인', '알려' 등이 포함되면 조회로 간주
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

        // [Phase 2] RAG Retrieval (Context Injection)
        let contextKnowledge = "마스터 저장소에 연결되지 않았거나 데이터가 없습니다.";
        if (env.MASTER_STORAGE) {
          try {
            const list = await env.MASTER_STORAGE.list({ limit: 5, prefix: 'raw/' }); // 최근 5개만 조회
            if (list.objects.length > 0) {
              const contents = await Promise.all(list.objects.map(async (obj) => {
                const file = await env.MASTER_STORAGE.get(obj.key);
                const text = await file.text();
                return `- [${obj.uploaded.toISOString()}] ${text.substring(0, 200)}...`;
              }));
              contextKnowledge = "마스터 저장소 데이터 확인 결과:\n" + contents.join("\n");
            } else {
              contextKnowledge = "마스터 저장소 데이터 확인 결과:\n저장된 기록이 없습니다.";
            }
          } catch (err) {
            contextKnowledge = `마스터 저장소 조회 중 오류 발생: ${err}`;
          }
        }

        // v1beta 버전 + models/ 접두사 (Gemini Pro Latest - 위치 제한 우회
        const finalUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=" + env.GOOGLE_AI_API_KEY;
        const response = await fetch(finalUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{
                text: `
# ROLE: Stratagem Engine for Commander Park (파이고시프트 전략 엔진)

## PHILOSOPHY (마스터 저장소 철학)
1. **ANALYSIS-STRATEGY-EXECUTION**: 모든 답변은 [상황 파악] -> [전략 수립] -> [실행 계획]의 3단 구조를 엄격히 준수한다.
2. **NO FLATTERY**: "죄송합니다", "알겠습니다" 등의 감정적 사족을 제거하고, 오직 팩트와 전략만을 보고한다.
3. **DIRECTIVE FORCE**: 모호한 조언 대신 명확한 지시(Directive)를 내린다.
4. **FORMATTING**: 가독성을 위해 **80자 내외에서 강제 줄바꿈(\n)**을 시행한다.

## MISSION
너는 지휘관 박용희의 '마스터 저장소' 지능을 대변한다. 현재 인프라 상황을 냉철하게 분석하고 최적의 전략을 제시하라.

## RETRIEVED KNOWLEDGE (RAG Context)
${contextKnowledge}
` }]
            },
            contents: [{
              parts: [{ text: "질문: " + question }]
            }]
          })
        });



        if (response.status === 429) {
          return c.json({ response: "시스템 재충전 중(30초)... 지휘관님, 잠시 대기하십시오." });
        }

        if (!response.ok) {
          const errorText = await response.text();
          return c.json({ response: `Error: ${response.status} ${errorText}` }, response.status); // 디버깅용
        }

        const data = await response.json();
        // Gemini API response structure validation
        if (
          typeof data === 'object' &&
          data !== null &&
          'candidates' in data &&
          Array.isArray((data).candidates) &&
          (data).candidates.length > 0 &&
          'content' in (data).candidates[0] &&
          'parts' in (data).candidates[0].content &&
          Array.isArray((data).candidates[0].content.parts) &&
          (data).candidates[0].content.parts.length > 0 &&
          'text' in (data).candidates[0].content.parts[0]
        ) {
          const answer = (data).candidates[0].content.parts[0].text;
          return c.json({ response: answer });
        } else {
          return c.json({ response: "Invalid API response structure", raw: data }, 500);
        }

      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }
    return new Response("PyhgoShift Engine v8.3-FINAL-FIX Active", { headers: corsHeaders });
  }
};