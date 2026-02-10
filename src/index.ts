export class SandboxContainer {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(request) { return new Response("Sandbox Active"); }
}

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    // 상태 체크 엔드포인트 (/health)
    if (new URL(request.url).pathname === "/health") {
      const start = Date.now();
      const status = {
        worker: "ONLINE",
        nvidia: env.NVIDIA_API_KEY ? "CONNECTED" : "MISSING",
        latency: `${Date.now() - start}ms`,
        timestamp: new Date().toISOString()
      };
      return new Response(JSON.stringify(status), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (new URL(request.url).pathname === "/ask") {
      try {
        const { question } = await request.json();
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.NVIDIA_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "moonshotai/kimi-k2.5",
            "messages": [{"role": "user", "content": question}],
            "stream": true
          })
        });

        return new Response(response.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }
    return new Response("Engine Online", { headers: corsHeaders });
  }
};
