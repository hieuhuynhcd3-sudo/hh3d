const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SuggestionRequest {
  apiKey: string;
  categories: string[];
  existingTitles: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as SuggestionRequest;

    if (!body.apiKey) {
      return new Response(
        JSON.stringify({ error: "Thiếu API key." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const avoidList = body.existingTitles.length > 0
      ? `\nKHÔNG lặp lại các tiêu đề đã tạo: ${body.existingTitles.join(", ")}`
      : "";

    const systemPrompt = `Bạn là chuyên gia sáng tạo nội dung video hoạt hình 3D Pixar cho trẻ em Việt Nam.
Hãy tạo gợi ý ý tưởng video ngắn hấp dẫn, hồn nhiên, mang đậm nét văn hóa Việt Nam tuổi thơ.

Trả về ĐÚNG định dạng JSON mảng, KHÔNG markdown, KHÔNG text thừa:
[
  {
    "title": "Tên video ngắn gọn",
    "idea": "Mô tả ý tưởng trung tâm 2-3 câu",
    "topic": "Chủ đề từ danh sách",
    "setting": "Bối cảnh",
    "emotion": "Cảm xúc"
  }
]`;

    const userPrompt = `Tạo ít nhất 6 gợi ý ý tưởng video hoạt hình 3D tuổi thơ Việt Nam.
Phân bổ các gợi ý vào các danh mục sau:
${body.categories.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Mỗi gợi ý phải có tiêu đề độc đáo, ý tưởng sáng tạo, phù hợp trẻ em Việt Nam.
${avoidList}

Trả về JSON mảng.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${body.apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 1.0,
          topP: 0.95,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(
        JSON.stringify({ error: `Gemini API lỗi (${geminiRes.status}): ${errText.slice(0, 300)}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!rawText) {
      return new Response(
        JSON.stringify({ error: "Gemini không trả về nội dung." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let suggestions;
    try {
      const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
      suggestions = JSON.parse(cleaned);
    } catch {
      suggestions = [];
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message ?? "Lỗi không xác định" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
