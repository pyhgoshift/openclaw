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
      return new Response(JSON.stringify({
        worker: "ONLINE",
        nvidia: env.NVIDIA_API_KEY ? "CONNECTED" : "READY",
        plan: "PAID_$5_FIXED"
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (url.pathname === "/ask") {
      try {
        const { question } = await request.json();
        const systemPrompt = `당신은 PyhgoShift의 Agent Orchestration OS 'OpenClaw'입니다. 헌장에 따라 비선형적 해법을 제시하십시오.`;

        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${env.NVIDIA_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            "model": "moonshotai/kimi-k2.5",
            "messages": [{"role": "system", "content": systemPrompt}, {"role": "user", "content": question}],
            "stream": true,
            "stream_options": {"include_usage": true} // 토큰 사용량 포함 명령
          })
        });

        return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }
    return new Response("PyhgoShift OS v5.0 Active");
  }
};
