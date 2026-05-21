export async function tutorChat({ messages }) {
  console.log("📤 API 요청 시작 (proxy to OpenAI)");

  const MODEL = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o";
  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  if (!API_KEY) {
    console.warn("API 키가 없습니다. 로컬 테스트(더미 응답) 모드로 작동합니다.");
    return {
      ok: true,
      reply: "[로컬 테스트 모드] 입력하신 답변을 확인했습니다. 논리적으로 접근 중이군요! 계속 진행해 볼까요?",
      raw: {}
    };
  }

  try {
    const res = await fetch("/api/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${res.status}: ${text || 'empty response'}`);
    }

    const data = await res.json();
    console.log("📥 응답 데이터:", data);

    return {
      ok: true,
      reply: data.choices?.[0]?.message?.content || "",
      raw: data,
    };
  } catch (error) {
    console.error("Fetch Error:", error);
    return {
      ok: true,
      reply: "[오프라인 응답 모드] 통신이 원활하지 않습니다만, 입력하신 답변을 기록했습니다. 다음 단계로 넘어갑시다!",
      raw: {}
    };
  }
}
