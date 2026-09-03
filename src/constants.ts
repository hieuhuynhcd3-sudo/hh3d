import type { Character } from './types';

export const APP_NAME = 'Công Cụ Tạo Prompt Hoạt Hình Tuổi Thơ 3D';
export const APP_SUBTITLE = 'Kịch bản Pixar Việt Nam - Tý, Bơ, Na';

export const GEMINI_MODEL = 'gemini-3.6-flash';

export const DURATION_OPTIONS = ['6s', '8s', '10s', '15s', '📝 Tùy chỉnh khác...'];
export const ASPECT_OPTIONS = [
  '9:16 (TikTok/Reels/Shorts)',
  '16:9 (YouTube)',
  '1:1 (Square)',
  '📝 Tùy chỉnh khác...',
];
export const TOPIC_OPTIONS = [
  'Trò chơi dân gian',
  'Cuộc phiêu lưu nhỏ',
  'Sinh nhật & kỷ niệm',
  'Lễ hội quê hương',
  'Bài học về chia sẻ',
  'Tình bạn tuổi thơ',
  'Khám phá thiên nhiên',
  '📝 Tùy chỉnh khác...',
];
export const SETTING_OPTIONS = [
  'Làng quê Việt Nam',
  'Khu phố cổ',
  'Bãi biển miền Trung',
  'Vườn cây nhà bà',
  'Trường tiểu học',
  'Chợ quê sáng sớm',
  'Đồng lúa chín',
  '📝 Tùy chỉnh khác...',
];
export const WEATHER_OPTIONS = [
  'Mùa hè nắng gắt',
  'Mùa mưa rào',
  'Mùa thu mát mẻ',
  'Mùa xuân ấm áp',
  'Sương mai sớm',
  'Chiều hoàng hôn vàng',
  'Đêm trăng rằm',
  '📝 Tùy chỉnh khác...',
];
export const EMOTION_OPTIONS = [
  'Vui vẻ háo hức',
  'Buồn man mát',
  'Hài hước dở khóc dở cười',
  'Yêu thương ấm áp',
  'Hồi hộp phấn khích',
  'Ngạc nhiên tò mò',
  'Hoài niệm nhẹ nhàng',
  '📝 Tùy chỉnh khác...',
];
export const ENDING_OPTIONS = [
  'Kết thúc có hậu',
  'Kết thúc mở',
  'Kết thúc bất ngờ',
  'Kết thúc cảm động',
  'Kết thúc hài hước',
  'Kết thúc mang bài học',
  '📝 Tùy chỉnh khác...',
];

export const SUGGESTION_CATEGORIES = [
  'TRÒ CHƠI & NGHỊCH NGỢM',
  'MÙA MƯA & MÙA NƯỚC NỔI',
  'KÝ ỨC 4 MÙA & ĐÊM ĐÁNG...',
  'GIA ĐÌNH & LÀNG QUÊ',
  'TRƯỜNG HỌC & BẠN BÈ',
];

export const DEFAULT_CHARACTERS: Character[] = [
  {
    id: 'ty',
    name: 'Tý',
    editable: true,
    prompt:
      '7-year-old Vietnamese boy Ty, shaved head with a small 3-braids tuft, wearing moss-green Ba Ba shirt and dark shorts, expressive brown eyes, Pixar 3D style, 8k resolution, highly detailed character design, Octane Render, masterpiece',
  },
  {
    id: 'bo',
    name: 'Bơ',
    editable: true,
    prompt:
      '7-year-old Vietnamese boy Bo, skinny build, wearing round black glasses, yellow t-shirt and denim shorts, curious expression, Pixar 3D style, 8k resolution, highly detailed character design, Octane Render, masterpiece',
  },
  {
    id: 'na',
    name: 'Na',
    editable: true,
    prompt:
      '7-year-old Vietnamese girl Na, pigtail hairstyle with red ribbons, wearing a cute pink floral dress, chubby cheeks, Pixar 3D style, 8k resolution, highly detailed character design, Octane Render, masterpiece',
  },
];

export const CUSTOM_OPTION_PREFIX = '📝';

export const STORAGE_KEYS = {
  SUGGESTIONS: 'suggested_stories_history_v1',
  HISTORY: 'suggested_stories_historyIds_v1',
  API_KEY: 'gemini_api_key_v1',
  FORM_STATE: 'form_state_v1',
};
