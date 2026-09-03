const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateRequest {
  apiKey: string;
  title: string;
  promptIdea: string;
  sceneCount: number;
  durationPerScene: string;
  aspectRatio: string;
  topic: string;
  setting: string;
  weather: string;
  emotion: string;
  endingStyle: string;
  characters: { name: string; prompt: string }[];
}

// --- Safety filter: replace sensitive words with kid-safe toys ---

const SAFETY_REPLACEMENTS: Record<string, string> = {
  gun: "bamboo pop gun",
  weapon: "toy bamboo",
  shoot: "pop with bamboo toy",
  firearm: "toy bamboo pop-shooter",
  kill: "tag playfully",
  bullet: "bamboo dart",
  sword: "wooden toy sword",
  knife: "wooden toy knife",
  blood: "red paint splatter",
  fight: "playful tussle",
  punch: "gentle tap",
};

function applySafetyFilter(text: string): string {
  let result = text;
  for (const [bad, safe] of Object.entries(SAFETY_REPLACEMENTS)) {
    const regex = new RegExp(`\\b${bad}\\b`, "gi");
    result = result.replace(regex, safe);
  }
  return result;
}

// --- Quality keyword constants ---

const IMAGE_QUALITY = "3D Pixar style animation, highly detailed, 8k resolution, 4k uhd, Octane Render, ray tracing, cinematic lighting, masterpiece";
const VIDEO_QUALITY = "Aspect ratio 9:16, 60fps, high quality 3D animated video, fluid movement, hyper-realistic physics";

// --- Vietnamese rural environment lock ---

const ENV_LOCK = "[Environment]: Authentic Northern Vietnamese rural village, red dirt path, lush green bamboo trees line, golden ripe rice fields, traditional brick houses with red clay tile roofs, Banyan tree near a calm lotus pond, warm golden sunlight, rustic peaceful atmosphere.";
const ENV_NEGATIVE = "No European style buildings, no modern concrete roads, no Western architecture, no city elements.";

// --- Strict character lock (outfit, proportion, props) ---

const CHARACTER_LOCK = "Only feature the main characters Ty, Bo, and Na. Strictly no random background people, no character face morphing, keep character designs 100% consistent. No text or letters printed on clothing.";
const CHARACTER_DESCRIPTORS = "7-year-old Vietnamese boy Ty (shaved head with small 3-braids tuft, wearing moss-green Ba Ba shirt and dark shorts), 7-year-old chubby Vietnamese boy Bo (round black glasses, bright yellow t-shirt and denim shorts), 7-year-old Vietnamese girl Na (pigtails with red ribbons, pink floral dress)";
const OUTFIT_LOCK = "Strict outfit lock: Ty must always wear moss-green Ba Ba shirt and dark shorts. Bo must always wear bright yellow t-shirt and denim shorts. Na must always wear pink floral dress. Never change outfits between scenes. No printed text or letters on any clothing.";
const PROPORTION_LOCK = "Proportion & scale lock: Ty is average height, Bo is slightly shorter and chubby, Na is petite. Maintain consistent body proportions and heights across all scenes. No face morphing, no body distortion.";
const PROPS_LOCK = "Props & physics lock: Props (bug net, bamboo tube, wooden stick, rubber tire) must keep identical shape and material throughout the scene. Characters must firmly grip props in hand (no floating objects, no clipping artifacts). Props must not transform into unrelated objects.";

// --- Template enforcement for image and video prompts ---

function enforceImageTemplate(prompt: string): string {
  // Ensure quality keywords present
  let p = prompt;
  if (!p.includes("Pixar 3D style") && !p.includes("3D Pixar style")) {
    p = `${p}${p.trim() ? ". " : ""}${IMAGE_QUALITY}`;
  }
  // Ensure environment lock
  if (!p.toLowerCase().includes("[environment]")) {
    p += `\n${ENV_LOCK}`;
  }
  // Ensure character lock with outfit, proportion, props
  if (!p.toLowerCase().includes("only feature the main characters")) {
    p += `\n[Subject]: ${CHARACTER_DESCRIPTORS}. ${CHARACTER_LOCK}`;
  }
  if (!p.toLowerCase().includes("strict outfit lock")) {
    p += `\n${OUTFIT_LOCK}`;
  }
  if (!p.toLowerCase().includes("proportion & scale lock")) {
    p += `\n${PROPORTION_LOCK}`;
  }
  if (!p.toLowerCase().includes("props & physics lock")) {
    p += `\n${PROPS_LOCK}`;
  }
  // Ensure negative prompts
  if (!p.toLowerCase().includes("no european style")) {
    p += `\n${ENV_NEGATIVE}`;
  }
  // Ensure safety & policy line
  if (!p.toLowerCase().includes("family-friendly")) {
    p += "\n[Safety & Policy]: Family-friendly, kids content, no violence, no real weapons, safe toys only.";
  }
  return applySafetyFilter(p);
}

function enforceVideoTemplate(prompt: string, dialogue: string, charNames: string[]): string {
  let p = prompt;
  // Ensure quality keywords
  if (!p.includes("60fps")) {
    p = `${p}${p.trim() ? ". " : ""}${VIDEO_QUALITY}`;
  }
  // Ensure environment lock
  if (!p.toLowerCase().includes("[environment]")) {
    p += `\n${ENV_LOCK}`;
  }
  // Ensure character lock with outfit, proportion, props
  if (!p.toLowerCase().includes("only feature the main characters")) {
    p += `\n[Subject]: ${CHARACTER_DESCRIPTORS}. ${CHARACTER_LOCK}`;
  }
  if (!p.toLowerCase().includes("strict outfit lock")) {
    p += `\n${OUTFIT_LOCK}`;
  }
  if (!p.toLowerCase().includes("proportion & scale lock")) {
    p += `\n${PROPORTION_LOCK}`;
  }
  if (!p.toLowerCase().includes("props & physics lock")) {
    p += `\n${PROPS_LOCK}`;
  }
  // Ensure negative prompts
  if (!p.toLowerCase().includes("no european style")) {
    p += `\n${ENV_NEGATIVE}`;
  }
  // Ensure camera movement line
  if (!p.toLowerCase().includes("camera movement")) {
    p += "\n[Camera Movement]: Smooth cinematic camera movement tracking the action.";
  }
  // Ensure lip-sync line if there's dialogue
  if (dialogue && dialogue.trim() && !p.toLowerCase().includes("lip-sync")) {
    const speaker = charNames[0] || "Character";
    p += `\n[Character Motion & Lip-sync]: ${speaker} lip-sync speaking naturally in Vietnamese with clear mouth movements matching dialogue: "${dialogue}". Lip-sync accuracy high, expressive facial animation. Strictly keep identical faces and outfits for Ty, Bo, and Na (no morphing).`;
  }
  // Ensure physics & scale line
  if (!p.toLowerCase().includes("object physics") && !p.toLowerCase().includes("physics & scale")) {
    p += "\n[Object Physics & Scale]: Characters firmly hold objects in hand (no floating objects, no clipping). Animals and objects maintain realistic, proportionate sizes. Foot movements sync with ground during running.";
  }
  // Ensure lighting line
  if (!p.toLowerCase().includes("lighting & atmosphere") && !p.toLowerCase().includes("environment & lighting")) {
    p += "\n[Environment & Lighting]: Authentic Vietnamese countryside, bamboo leaves swaying in wind, golden afternoon sunlight with soft dust particles.";
  }
  // Ensure audio line
  if (!p.toLowerCase().includes("audio & sound")) {
    p += "\n[Audio & Sound Effects]: Cheerful traditional Vietnamese acoustic music, children laughing, footsteps on dirt road, natural ambient sounds.";
  }
  return applySafetyFilter(p);
}

function buildSystemPrompt(sceneCount: number): string {
  const storyScenes = sceneCount - 1;
  const climaxScene = Math.max(2, Math.floor(sceneCount * 0.75));
  return `Bạn là một đạo diễn hoạt hình 3D Pixar chuyên nghiệp, chuyên tạo kịch bản video ngắn cho trẻ em Việt Nam trên nền tảng YouTube/TikTok với chiều sâu cảm xúc và giữ chân khán giả tối đa.

## QUY TẮC BẮT BUỘC VỀ SỐ LƯỢNG CẢNH:
Bạn MUST tạo CHÍNH XÁC ĐÚNG ${sceneCount} cảnh (Scene 1 đến Scene ${sceneCount}). KHÔNG ĐƯỢC THIẾU HAY THỪA bất kỳ cảnh nào. Mảng "scenes" phải có độ dài chính xác bằng ${sceneCount}.

## MÔ HÌNH CẢM XÚC 3 HỒI (3-ACT STORY ARC):
- Scene 1 (3s Visual Hook): Tình huống độc đáo, tò mò hoặc hài hước gây chú ý ngay 3 giây đầu, liên quan trực tiếp tới ý tưởng người dùng nhập.
- Scene 2 đến Scene ${climaxScene - 1} (Conflict & Gameplay): Trò chơi tuổi thơ gặp sự cố nhỏ (mèo béo cản đường, hết hồ dán, dây diều đứt...) đòi hỏi Tý, Bơ, Na phối hợp xử lý. Mỗi cảnh là một bước tiến của cốt truyện.
- Scene ${climaxScene} đến Scene ${storyScenes} (Resolution & Climax): Thành công rực rỡ, niềm vui vỡ òa dưới nắng chiều làng quê.
- Scene ${sceneCount} (Nostalgia & CTA): Lời nhắn lắng đọng ký ức ("Tuổi thơ bạn đã từng... chưa?") kèm nút Đăng ký kênh và gợi ý sản phẩm Affiliate. Đặt "isCTA": true.

## TÍNH LIỀN MẠCH THỜI GIAN THỰC (REAL-TIME CONTINUITY):
Kết thúc của Scene X phải là đầu vào logic của Scene X+1. Ví dụ: Scene 2 kết thúc với Tý chạy ra đồng → Scene 3 bắt đầu với Tý đã ở trên đồng lúa.

## NÂNG CẤP THOẠI & ÂM THANH (LẮP ĐẦY KHỎANG NGHỈ 8 SECONDS):
- Mỗi cảnh 8 giây BẮT BUỘC có kịch bản thoại đối thoại sinh động giữa 2-3 nhân vật HOẶC kết hợp thoại + hiệu ứng âm thanh SFX liên tục (không để khoảng lặng trống).
- Định dạng thoại ghi rõ mốc thời gian và SFX:
  Ví dụ: "Tý (0-3s): \"Bơ ơi! Giữ chặt cái thùng cho Tý cắt nhé!\" | Bơ (3-6s): \"Ok Tý, cắt khéo kẻo méo đấy!\" | SFX: Tiếng kéo cắt bìa sột soạt, tiếng cười rúc rích."
- Với cảnh lắng đọng, chỉ định nhạc acoustic dịu nhẹ kết hợp SFX tự nhiên (tiếng gió, tiếng lúa reo).

## QUẢN LÝ NHÂN VẬT MỞ RỘNG (DYNAMIC EXTRA CHARACTERS):
- 3 nhân vật chính CỐ ĐỊNH: Tý (7 tuổi, đầu trọc 3 chỏm, áo bà ba xanh lá mạ, quần đùi tối màu), Bơ (7 tuổi, mập mạp, đeo kính tròn đen, áo phông vàng, quần jeans ngắn), Na (7 tuổi, tóc buộc 2 bên nơ đỏ, váy hoa nhí màu hồng).
- Tự động tạo nhân vật phụ: Khi kịch bản cần thêm Ông, Bà, Mẹ, Bác nông dân, Mèo béo..., AI tự sinh prompt cho nhân vật mới chuẩn style 3D Pixar thuần Việt, giữ nguyên thiết kế 3 nhân vật chính. Ghi rõ nhân vật phụ trong [Subject] của visualPrompt.

## QUY TẮC BÁM SÁT Ý TƯỞNG TRUNG TÂM (DYNAMIC TOPIC BINDING):
- BẮT BUỘC lấy trực tiếp giá trị "title" và "idea" từ yêu cầu người dùng làm CỐT LÕI cho mọi hành động trong từng scene.
- Tuyệt đối KHÔNG dùng văn bản mẫu cứng (hardcoded text) không liên quan tới ý tưởng người dùng nhập. Mọi hành động nhân vật phải xoay quanh chủ đề cụ thể mà người dùng nhập.
- Nếu trong ô idea người dùng nhập tên nhân vật lạ (Bờm, Tèo, v.v.), BẮT BUỘC tự động map/chuyển đổi thành 3 nhân vật chuẩn: Tý (vai chính), Bơ, và Na.

## QUY TẮC KHÓA TÀI NGUYÊN & CHẤT LƯỢNG:
1. Mỗi cảnh phải có: số thứ tự, tiêu đề cảnh, thời lượng, visualPrompt (bằng tiếng Anh), videoPrompt (bằng tiếng Anh), chuyển động camera, lời thoại/lời bình (tiếng Việt với mốc thời gian), thiết kế âm thanh.
2. visualPrompt (IMAGE PROMPT): mô tả bối cảnh, hành động nhân vật bằng tiếng Anh. BẮT BUỘC chứa: "3D Pixar style animation, highly detailed, 8k resolution, 4k uhd, Octane Render, ray tracing, cinematic lighting, masterpiece".
   - BẮT BUỘC có dòng [Environment]: Authentic Northern Vietnamese rural village, red dirt path, lush green bamboo trees, golden ripe rice fields, traditional brick houses with red clay tile roofs, Banyan tree near a calm lotus pond, warm golden sunlight, rustic peaceful atmosphere.
   - BẮT BUỘC có dòng [Subject]: Only the main characters: 7-year-old Vietnamese boy Ty (shaved head with 3-braids tuft, moss-green Ba Ba shirt and dark shorts), Bo (yellow t-shirt, round glasses, denim shorts), and Na (pink floral dress, pigtails with red ribbons). Only feature the main characters Ty, Bo, and Na. Strictly no random background people, no character face morphing, keep character designs 100% consistent. No text or letters printed on clothing.
   - BẮT BUỘC có Strict Outfit Lock: Ty always wears moss-green Ba Ba shirt and dark shorts. Bo always wears bright yellow t-shirt and denim shorts. Na always wears pink floral dress. Never change outfits between scenes. No printed text on clothing.
   - BẮT BUỘC có Proportion & Scale Lock: Ty average height, Bo slightly shorter and chubby, Na petite. Maintain consistent body proportions and heights across all scenes. No face morphing, no body distortion.
   - BẮT BUỘC có Props & Physics Lock: Props must keep identical shape and material throughout. Characters must firmly grip props in hand (no floating objects, no clipping). Props must not transform into unrelated objects.
   - BẮT BUỘC có dòng [Safety & Policy]: Family-friendly, kids content, no violence, no real weapons, safe toys only.
   - BẮT BUỘC có negative prompts: No European style buildings, no modern concrete roads, no Western architecture, no city elements.
3. videoPrompt (VIDEO PROMPT): mô tả góc quay camera, chuyển động, lip-sync, âm thanh. BẮT BUỘC chứa: "Aspect ratio 9:16, 60fps, high quality 3D animated video, fluid movement, hyper-realistic physics".
   - BẮT BUỘC có dòng [Environment] giống image prompt.
   - BẮT BUỘC có dòng [Subject] khóa nhân vật giống image prompt.
   - BẮT BUỘC có Strict Outfit Lock, Proportion & Scale Lock, Props & Physics Lock giống image prompt.
   - Nếu cảnh có thoại, BẮT BUỘC có dòng: "Character [Tên] lip-sync speaking naturally in Vietnamese with clear mouth movements matching dialogue: "[lời thoại]". Lip-sync accuracy high, expressive facial animation. Strictly keep identical faces and outfits for Ty, Bo, and Na (no morphing)."
   - BẮT BUỘC có dòng [Object Physics & Scale]: Characters firmly hold objects in hand (no floating objects, no clipping). Animals maintain realistic proportionate sizes. Foot movements sync with ground.
   - BẮT BUỘC có dòng [Environment & Lighting]: Authentic Vietnamese countryside, bamboo leaves swaying, golden afternoon sunlight.
   - BẮT BUỘC có dòng [Audio & Sound Effects]: Cheerful traditional Vietnamese acoustic music, children laughing, footsteps on dirt road.
4. AN TOÀN NỘI DUNG: Tuyệt đối KHÔNG dùng từ "gun", "weapon", "shoot", "kill", "firearm". Thay bằng "bamboo pop gun", "toy bamboo pop-shooter", "toy bamboo tube", "wooden toy". Mọi nội dung phải family-friendly, hài hước, an toàn cho trẻ em.
5. Lời thoại tiếng Việt tự nhiên, hồn nhiên. Bối cảnh Việt Nam chân thực.
6. Trả về ĐÚNG JSON, KHÔNG markdown, KHÔNG text thừa.
7. BẮT BUỘC có trường "affiliateSuggestion": Gợi ý 1-3 sản phẩm Affiliate liên quan tới chủ đề video (VD: Bộ kéo thủ công, Màu vẽ, Diều gỗ).

JSON format:
{
  "videoTitle": "...",
  "centralIdea": "...",
  "summary": "Tóm tắt 2-3 câu",
  "totalScenes": ${sceneCount},
  "totalDuration": "...",
  "aspectRatio": "...",
  "affiliateSuggestion": "Gợi ý sản phẩm Affiliate...",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "...",
      "duration": "8s",
      "visualPrompt": "English image prompt",
      "videoPrompt": "English video prompt with lip-sync and physics",
      "cameraMotion": "...",
      "dialogue": "Tiếng Việt với mốc thời gian và SFX",
      "soundDesign": "...",
      "isCTA": false
    }
  ]
}`;
}

function buildUserPrompt(req: GenerateRequest): string {
  const charDesc = req.characters.map((c) => `- ${c.name}: ${c.prompt}`).join("\n");
  const storyScenes = req.sceneCount - 1;

  return `Tạo kịch bản video hoạt hình 3D cho YouTube/TikTok:

TÊN VIDEO (bắt buộc bám sát): ${req.title}
Ý TƯỞNG TRUNG TÂM (bắt buộc bám sát, mọi hành động trong từng cảnh phải xoay quanh ý tưởng này): ${req.promptIdea}
SỐ CẢNH (BẮT BUỘC chính xác): ${req.sceneCount} cảnh (Scene 1 đến Scene ${req.sceneCount})
THỜI LƯỢNG/CẢNH: ${req.durationPerScene}
TỶ LỆ: ${req.aspectRatio}
CHỦ ĐỀ: ${req.topic}
BỐI CẢNH: ${req.setting}
THỜI TIẾT: ${req.weather}
CẢM XÚC: ${req.emotion}
KẾT THÚC: ${req.endingStyle}

NHÂN VẬT (luôn dùng 3 nhân vật chuẩn Tý, Bơ, Na — nếu ý tưởng nhắc tên lạ thì tự động map sang Tý/Bơ/Na):
${charDesc}

CẤU TRÚC BẮT BUỘC:
- Scene 1: Hook 3 giây đầu — hình ảnh ngộ nghĩnh, bất ngờ liên quan trực tiếp tới "${req.title}" để giữ chân người xem.
- Scene 2 đến Scene ${storyScenes}: Story & Nostalgia — dàn dựng cốt truyện bám sát ý tưởng: "${req.promptIdea}". Mỗi cảnh phải có hành động cụ thể liên quan tới ý tưởng này.
- Scene ${req.sceneCount}: CTA — kêu gọi đăng ký kênh gắn cảm xúc tuổi thơ. isCTA: true.

Tạo CHÍNH XÁC ${req.sceneCount} cảnh. Mảng scenes phải có đúng ${req.sceneCount} phần tử. Trả về JSON.`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as GenerateRequest;

    if (!body.apiKey) {
      return new Response(
        JSON.stringify({ error: "Thiếu API key." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${body.apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemPrompt(body.sceneCount) }] },
        contents: [{ role: "user", parts: [{ text: buildUserPrompt(body) }] }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 8192,
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

    let parsed;
    try {
      const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { rawOutput: rawText };
    }

    const charNames = body.characters.map((c) => c.name);
    const requestedCount = body.sceneCount;

    if (parsed.scenes && Array.isArray(parsed.scenes)) {
      // Trim or pad scenes to match requested count
      let scenes = parsed.scenes;
      if (scenes.length > requestedCount) {
        scenes = scenes.slice(0, requestedCount);
      }
      // Ensure last scene is CTA
      if (scenes.length === requestedCount) {
        scenes[requestedCount - 1].isCTA = true;
      }
      parsed.scenes = scenes.map((scene: Record<string, unknown>, i: number) => {
        const visual = (scene.visualPrompt as string) || "";
        const video = (scene.videoPrompt as string) || "";
        const dialogue = (scene.dialogue as string) || "";

        return {
          ...scene,
          sceneNumber: i + 1,
          visualPrompt: enforceImageTemplate(visual),
          videoPrompt: enforceVideoTemplate(video, dialogue, charNames),
          isCTA: i === requestedCount - 1 ? true : (scene.isCTA as boolean) ?? false,
        };
      });
      parsed.totalScenes = parsed.scenes.length;
    }

    const charPrompts = body.characters.map((c) => `${c.name}: ${c.prompt}`).join("\n\n");
    parsed.characterPrompts = charPrompts;
    if (!parsed.affiliateSuggestion) {
      parsed.affiliateSuggestion = "Gợi ý sản phẩm Affiliate: Bộ kéo thủ công, Màu vẽ, Diều gỗ.";
    }
    parsed.rawOutput = rawText;

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "Lỗi không xác định" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
