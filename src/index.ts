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

    // 헬스체크: 즉시 종료 헤더 추가
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ worker: "ONLINE", nvidia: env.NVIDIA_API_KEY ? "CONNECTED" : "MISSING" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Connection": "close" }
      });
    }

    if (url.pathname === "/ask") {
      try {
        const { question } = await request.json();
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${env.NVIDIA_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ "model": "moonshotai/kimi-k2.5", "messages": [{"role": "user", "content": question}], "stream": true })
        });

        // 브라우저가 끝을 인식하도록 스트리밍 응답 반환
        return new Response(response.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Transfer-Encoding": "chunked" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }
    return new Response("OK", { headers: corsHeaders });
  }
};
