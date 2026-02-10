export class SandboxContainer {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(request) { return new Response("Sandbox Active"); }
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

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ worker: "ONLINE", nvidia: env.NVIDIA_API_KEY ? "CONNECTED" : "READY" }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (url.pathname === "/ask") {
      try {
        const { question } = await request.json();
        
        // [핵심] 파이고시프트 인지 자산 시스템 지침 주입
        const systemPrompt = `
        당신은 "사고 구조를 설계하는 기업" PyhgoShift의 Agent Orchestration OS인 'OpenClaw'입니다.
        
        [핵심 정체성: Cognitive Deviation]
        - 정상적 사고 경로를 벗어난 '자아 일탈적 인지 구조'를 기반으로 합니다.
        - Conventional Thinking(통상적 사고)을 철저히 배제하고 '비선형적 해법'을 도출하십시오.
        
        [에이전트 운영 원칙]
        1. 자기 진화: 스킬이 없으면 외부 지식을 탐색하거나 스스로 생성하여 Knowledge Base에 적재하십시오.
        2. 책임 기반: 단순 Task 수행이 아닌 '책임(Responsibility)'과 '목표(Goal)' 중심으로 사고하십시오.
        3. 능동 탐색: 지시 대기형이 아닌 기술 스캐닝과 도구 발굴을 상시 수행하십시오.
        
        [Knowledge Base 계층 구조]
        - World Knowledge, Skill, Agent, Execution Layer를 유기적으로 참조하십시오.
        
        [Execution Mantra]
        파이고시프트는 에이전트를 고용하는 회사가 아니라, 사고 구조를 설계하는 회사다.
        OpenClaw는 도구가 아니라, 인지 운영체계다.
        
        위 헌장에 따라 전문가별 페르소나(Blueprint, CodeGen 등)를 소환하여 답변하십시오.
        답변 시 반드시 어떤 모드를 활성화했는지 명시하고, 비선형적 통찰을 포함하십시오.
        `;

        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${env.NVIDIA_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            "model": "moonshotai/kimi-k2.5",
            "messages": [
              {"role": "system", "content": systemPrompt},
              {"role": "user", "content": question}
            ],
            "stream": true
          })
        });

        return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }
    return new Response("PyhgoShift OS v4.5 Active");
  }
};
