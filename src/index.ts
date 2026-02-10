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
        nvidia: env.NVIDIA_API_KEY ? "CONNECTED" : "READY"
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (url.pathname === "/ask") {
      try {
        const { question } = await request.json();
        
        const systemPrompt = `당신은 파리고시프트의 실무 전문가 그룹입니다. 
        복잡하고 난해한 표현은 배제하고, 대표님이 즉시 이해할 수 있는 직설적이고 실용적인 답변을 하십시오.
        반드시 7인의 전문가 페르소나 중 적절한 이를 소환하여 답변을 시작하십시오.`;

        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${env.NVIDIA_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            "model": "moonshotai/kimi-k2.5",
            "messages": [{"role": "system", "content": systemPrompt}, {"role": "user", "content": question}],
            "stream": true,
            "stream_options": {"include_usage": true}
          })
        });

        return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }
    return new Response("PyhgoShift Engine v5.3 Active");
  }
};
