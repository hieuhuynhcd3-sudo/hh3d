export interface Character {
  id: string;
  name: string;
  editable: boolean;
  prompt: string;
}

export interface VideoIdeaForm {
  title: string;
  prompt_idea: string;
}

export interface QuickSetupForm {
  scene_count: number;
  duration_per_scene: string;
  aspect_ratio: string;
  topic: string;
  setting: string;
  weather: string;
  emotion: string;
  ending_style: string;
}

export interface SuggestionItem {
  id: string;
  title: string;
  idea: string;
  topic: string;
  setting: string;
  emotion: string;
  script: string;
  createdAt: number;
}

export interface ScenePrompt {
  sceneNumber: number;
  title: string;
  duration: string;
  visualPrompt: string;
  videoPrompt: string;
  cameraMotion: string;
  dialogue: string;
  soundDesign: string;
  isCTA?: boolean;
}

export interface GeneratedScript {
  videoTitle: string;
  centralIdea: string;
  summary: string;
  characterPrompts: string;
  affiliateSuggestion?: string;
  totalScenes: number;
  totalDuration: string;
  aspectRatio: string;
  scenes: ScenePrompt[];
  rawOutput: string;
}
