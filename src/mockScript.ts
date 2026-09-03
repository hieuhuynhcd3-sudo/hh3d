import type { GeneratedScript } from './types';

const IMAGE_QUALITY = '3D Pixar style animation, highly detailed, 8k resolution, 4k uhd, Octane Render, ray tracing, cinematic lighting, masterpiece';
const VIDEO_QUALITY = 'Aspect ratio 9:16, 60fps, high quality 3D animated video, fluid movement, hyper-realistic physics';
const ENV_LOCK = '[Environment]: Authentic Northern Vietnamese rural village, red dirt path, lush green bamboo trees line, golden ripe rice fields, traditional brick houses with red clay tile roofs, Banyan tree near a calm lotus pond, warm golden sunlight, rustic peaceful atmosphere.';
const ENV_NEGATIVE = 'No European style buildings, no modern concrete roads, no Western architecture, no city elements.';
const CHARACTER_LOCK = 'Only feature the main characters Ty, Bo, and Na. Strictly no random background people, no character face morphing, keep character designs 100% consistent. No text or letters printed on clothing.';
const CHARACTER_DESCRIPTORS = '7-year-old Vietnamese boy Ty (shaved head with small 3-braids tuft, wearing moss-green Ba Ba shirt and dark shorts), 7-year-old chubby Vietnamese boy Bo (round black glasses, bright yellow t-shirt and denim shorts), 7-year-old Vietnamese girl Na (pigtails with red ribbons, pink floral dress)';
const OUTFIT_LOCK = 'Strict outfit lock: Ty must always wear moss-green Ba Ba shirt and dark shorts. Bo must always wear bright yellow t-shirt and denim shorts. Na must always wear pink floral dress. Never change outfits between scenes. No printed text or letters on any clothing.';
const PROPORTION_LOCK = 'Proportion & scale lock: Ty is average height, Bo is slightly shorter and chubby, Na is petite. Maintain consistent body proportions and heights across all scenes. No face morphing, no body distortion.';
const PROPS_LOCK = 'Props & physics lock: Props must keep identical shape and material throughout the scene. Characters must firmly grip props in hand (no floating objects, no clipping artifacts). Props must not transform into unrelated objects.';
const SAFETY = '[Safety & Policy]: Family-friendly, kids content, no violence, no real weapons, safe toys only.';

function buildImagePrompt(action: string): string {
  return `${IMAGE_QUALITY}\n[Subject]: ${CHARACTER_DESCRIPTORS}. ${CHARACTER_LOCK}\n${ENV_LOCK}\n[Action & Composition]: ${action}\n${OUTFIT_LOCK}\n${PROPORTION_LOCK}\n${PROPS_LOCK}\n${ENV_NEGATIVE}\n${SAFETY}`;
}

function buildVideoPrompt(action: string, dialogue: string, camera: string, sound: string): string {
  let p = `${VIDEO_QUALITY}\n${ENV_LOCK}\n[Subject]: ${CHARACTER_DESCRIPTORS}. ${CHARACTER_LOCK}\n${OUTFIT_LOCK}\n${PROPORTION_LOCK}\n${PROPS_LOCK}\n${ENV_NEGATIVE}\n[Camera Movement]: ${camera}`;
  if (dialogue) {
    p += `\n[Character Motion & Lip-sync]: Ty lip-sync speaking naturally in Vietnamese with clear mouth movements matching dialogue: "${dialogue}". Lip-sync accuracy high, expressive facial animation. Strictly keep identical faces and outfits for Ty, Bo, and Na (no morphing).`;
  }
  p += `\n[Object Physics & Scale]: Characters firmly hold objects in hand (no floating objects, no clipping). Animals and objects maintain realistic, proportionate sizes. Foot movements sync with ground during running.`;
  p += `\n[Environment & Lighting]: Authentic Vietnamese countryside, bamboo leaves swaying in wind, golden afternoon sunlight with soft dust particles.`;
  p += `\n[Audio & Sound Effects]: ${sound}`;
  return p;
}

export const MOCK_SCRIPT: GeneratedScript = {
  videoTitle: 'Tý và ngày hội làng quê',
  centralIdea: 'Tý, Bơ, Na cùng nhau khám phá ngày hội làng quê Việt Nam với trò chơi dân gian và niềm vui tuổi thơ.',
  summary: 'Ba bạn nhỏ Tý, Bơ, Na rủ nhau ra ngày hội làng. Các bạn chơi ô ăn quan, ăn quà cổ vũ, rồi cùng nhau rước đèn lồng. Kết thúc bằng lời kêu gọi đăng ký kênh.',
  characterPrompts: 'Tý: 7-year-old Vietnamese boy Ty, shaved head with a small 3-braids tuft, wearing moss-green Ba Ba shirt and dark shorts, expressive brown eyes, Pixar 3D style, 8k resolution, highly detailed character design, Octane Render, masterpiece\n\nBơ: 7-year-old Vietnamese boy Bo, skinny build, wearing round black glasses, yellow t-shirt and denim shorts, curious expression, Pixar 3D style, 8k resolution, highly detailed character design, Octane Render, masterpiece\n\nNa: 7-year-old Vietnamese girl Na, pigtail hairstyle with red ribbons, wearing a cute pink floral dress, chubby cheeks, Pixar 3D style, 8k resolution, highly detailed character design, Octane Render, masterpiece',
  totalScenes: 4,
  totalDuration: '32s',
  aspectRatio: '9:16',
  rawOutput: '',
  scenes: [
    {
      sceneNumber: 1,
      title: 'Sáng sớm ra hội làng',
      duration: '8s',
      visualPrompt: buildImagePrompt('Ty, Bo, and Na walking together on a red dirt village path toward a festive village fair, laughing excitedly. Wide shot, warm morning sunlight, vibrant green bamboo backdrop.'),
      videoPrompt: buildVideoPrompt(
        'Three children walking joyfully on a dirt path toward the village fair, bouncing steps, waving hands',
        'Đi hội làng nhanh lên các bạn ơi!',
        'Smooth tracking shot following the three children from behind as they walk toward the village',
        'Cheerful traditional Vietnamese acoustic music, birds chirping, footsteps on dirt path',
      ),
      cameraMotion: 'Smooth tracking shot following from behind',
      dialogue: 'Đi hội làng nhanh lên các bạn ơi!',
      soundDesign: 'Cheerful traditional Vietnamese acoustic music, birds chirping, footsteps on dirt path',
      isCTA: false,
    },
    {
      sceneNumber: 2,
      title: 'Chơi ô ăn quan',
      duration: '8s',
      visualPrompt: buildImagePrompt('Ty and Bo playing o an quan (traditional Vietnamese board game) on the ground with small stones, Na watching and cheering beside them. Medium shot, dust particles in warm sunlight.'),
      videoPrompt: buildVideoPrompt(
        'Ty and Bo squatting on the ground playing a board game with stones, Na jumping and clapping behind them, natural hand movements',
        'Bơ ơi đừng để Tý ăn quân đó!',
        'Overhead angle slowly tilting down to show the board game and children faces',
        'Playful acoustic guitar, children laughing, stones clicking on the board',
      ),
      cameraMotion: 'Overhead tilt down to medium shot',
      dialogue: 'Bơ ơi đừng để Tý ăn quân đó!',
      soundDesign: 'Playful acoustic guitar, children laughing, stones clicking on the board',
      isCTA: false,
    },
    {
      sceneNumber: 3,
      title: 'Ăn quà cổ vũ',
      duration: '8s',
      visualPrompt: buildImagePrompt('Na happily eating a banh ran (sesame ball) while Ty holds a banh mi, Bo drinking nuoc mia (sugarcane juice) from a cup. Sitting on a wooden bench near a lotus pond, golden afternoon light.'),
      videoPrompt: buildVideoPrompt(
        'Na biting into a sesame ball with crumbs on her cheek, Ty holding a banh mi, Bo sipping sugarcane juice, all laughing on a bench',
        'Bánh rán giòn quá mẹ ơi!',
        'Side panning shot showing all three children on the bench eating happily',
        'Festive village ambient sounds, munching sounds, children giggling',
      ),
      cameraMotion: 'Side panning shot along the bench',
      dialogue: 'Bánh rán giòn quá mẹ ơi!',
      soundDesign: 'Festive village ambient sounds, munching sounds, children giggling',
      isCTA: false,
    },
    {
      sceneNumber: 4,
      title: 'CTA - Đăng ký kênh',
      duration: '8s',
      visualPrompt: buildImagePrompt('Ty, Bo, and Na standing together in front of a Banyan tree, waving at the camera with big smiles, a colorful Subscribe button graphic floating above. Wide shot, warm sunset.'),
      videoPrompt: buildVideoPrompt(
        'Three children waving enthusiastically at camera, jumping slightly, bright smiles, a subscribe button animation appearing',
        'Các bạn nhớ đăng ký kênh để xem thêm nhiều video vui nhé!',
        'Static wide shot with slight zoom in on the three children waving',
        'Upbeat jingle, children voices saying subscribe, warm ambient village sounds',
      ),
      cameraMotion: 'Static wide shot with slight zoom in',
      dialogue: 'Các bạn nhớ đăng ký kênh để xem thêm nhiều video vui nhé!',
      soundDesign: 'Upbeat jingle, children voices saying subscribe, warm ambient village sounds',
      isCTA: true,
    },
  ],
};
