export class SandboxContainer {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }
  async fetch(request) {
    // [강력 조치] 모든 도메인에서의 접속을 무조건 허용 (CORS)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };

    // 브라우저의 사전 확인(Preflight) 요청 즉시 승인
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    if (url.pathname === "/ask") {
      try {
        const { question } = await request.json();
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.env.NVIDIA_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "moonshotai/kimi-k2.5",
            "messages": [{"role": "user", "content": question}],
            "stream": true
          })
        });

        // 스트리밍 데이터 전송 시에도 CORS 헤더 포함
        return new Response(response.body, {
          headers: { 
            ...corsHeaders, 
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache"
          }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { 
          status: 500, 
          headers: corsHeaders 
        });
      }
    }
    return new Response("Engine Online", { headers: corsHeaders });
  }
}

export default {
  async fetch(request, env) {
    const id = env.MOLT_SANDBOX.idFromName("global-sandbox");
    const obj = env.MOLT_SANDBOX.get(id);
    return await obj.fetch(request);
  }
};
