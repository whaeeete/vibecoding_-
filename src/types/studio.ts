export type StudioTab = "mentor" | "sparks" | "examples" | "saved";

export type GradeLevel = "초등 고학년" | "중학생" | "고등학생" | "자유 창작";

export type ArtMedium =
  | "수채화"
  | "연필·목탄 소묘"
  | "아크릴·포스터 컬러"
  | "콜라주·혼합매체"
  | "디지털 드로잉"
  | "조소·입체 조형";

export type CompositionType =
  | "rule_of_thirds"
  | "diagonal"
  | "centered"
  | "horizon"
  | "radial";

export interface ColorSwatch {
  name: string;
  hex: string;
  role: string;
}

export interface StudioStep {
  id: string;
  label: string;
  done: boolean;
}

export interface ConceptPlan {
  id: string;
  updatedAt: string;
  gradeLevel: GradeLevel;
  medium: ArtMedium;
  theme: string;
  title: string;
  artistStatement: string;
  subject: string;
  moodKeywords: string[];
  compositionType: CompositionType;
  compositionNote: string;
  materials: string[];
  colorPalette: ColorSwatch[];
  steps: StudioStep[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "mentor";
  text: string;
  timestamp: string;
  sketchPreviewUrl?: string;
  mentorTip?: string;
}

export interface IdeaSpark {
  id: string;
  title: string;
  hook: string;
  subject: string;
  visualFocus: string;
  compositionType: CompositionType;
  compositionNote: string;
  moodKeywords: string[];
  materials: string[];
  colorPalette: ColorSwatch[];
  firstStep: string;
  steps: string[];
}

export interface ClassPromptTemplate {
  id: string;
  category: string;
  gradeLevel: GradeLevel;
  medium: ArtMedium;
  theme: string;
  title: string;
  summary: string;
  imageUrl: string;
  imageAlt: string;
  openingQuestion: string;
  quickReplies: string[];
  concept: Omit<ConceptPlan, "id" | "updatedAt">;
}
