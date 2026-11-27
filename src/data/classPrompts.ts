import type { ArtMedium, ClassPromptTemplate, ConceptPlan, GradeLevel } from "../types/studio";

export const GRADE_LEVELS: GradeLevel[] = ["초등 고학년", "중학생", "고등학생", "자유 창작"];

export const ART_MEDIUMS: ArtMedium[] = [
  "수채화",
  "연필·목탄 소묘",
  "아크릴·포스터 컬러",
  "콜라주·혼합매체",
  "디지털 드로잉",
  "조소·입체 조형",
];

export const STAGE_DEFINITIONS = [
  {
    id: 1,
    number: "01",
    label: "주제 탐색",
    subtitle: "표현하고 싶은 이야기와 감정 찾기",
  },
  {
    id: 2,
    number: "02",
    label: "소재·매체",
    subtitle: "중심 대상과 어울리는 질감 선택하기",
  },
  {
    id: 3,
    number: "03",
    label: "구도·색채",
    subtitle: "시선의 흐름과 4색 팔레트 구성하기",
  },
  {
    id: 4,
    number: "04",
    label: "제작 계획",
    subtitle: "수업 시간 안에 완성할 작업 순서 정리",
  },
] as const;

export const DEFAULT_QUICK_REPLIES = [
  "어디서부터 주제를 정해야 할지 막막해요",
  "일상 속 소중한 물건을 그려보고 싶어요",
  "빛과 그림자가 돋보이는 풍경을 구상 중이에요",
];

export function createInitialConcept(
  gradeLevel: GradeLevel = "중학생",
  medium: ArtMedium = "수채화",
  theme = "기억 속의 빛과 장소"
): ConceptPlan {
  return {
    id: `plan-${Date.now()}`,
    updatedAt: new Date().toISOString(),
    gradeLevel,
    medium,
    theme,
    title: "새로운 작품 구상",
    artistStatement: "멘토와 대화를 나누면 나만의 표현 의도와 핵심 문장이 이곳에 정리됩니다.",
    subject: "중심 대상과 배경 요소를 탐색 중입니다.",
    moodKeywords: ["서정적", "자연광", "여백"],
    compositionType: "rule_of_thirds",
    compositionNote: "화면을 가로·세로 삼분할하여 교차점 중 하나에 시선이 머무는 주제를 배치합니다.",
    materials: ["8절 켄트지 또는 수채화지", "2B 연필·지우개", "수채 물감 세트", "둥근 붓 6호·12호"],
    colorPalette: [
      { name: "마리골드 오렌지", hex: "#F59E0B", role: "주조색" },
      { name: "웜 샌드", hex: "#D6C7B2", role: "보조색" },
      { name: "스톤 그레이", hex: "#78716C", role: "보조색" },
      { name: "번트 앰버", hex: "#B45309", role: "강조색" },
    ],
    steps: [
      { id: "s1", label: "작은 썸네일 스케치 2~3개로 구도 비교하기", done: false },
      { id: "s2", label: "연필로 큰 덩어리와 여백의 위치 가볍게 잡기", done: false },
      { id: "s3", label: "밝은 면부터 맑은 톤으로 전체 분위기 깔기", done: false },
      { id: "s4", label: "강조색과 어두운 그림자로 시선 포인트 마무리하기", done: false },
    ],
  };
}

export const CLASS_PROMPT_TEMPLATES: ClassPromptTemplate[] = [
  {
    id: "still-life-north-light",
    category: "관찰 표현",
    gradeLevel: "중학생",
    medium: "연필·목탄 소묘",
    theme: "창가 빛 아래의 정물과 시간의 결",
    title: "오후의 도자기와 유칼립투스",
    summary: "같은 사물이라도 빛의 방향과 천의 주름에 따라 전혀 다른 분위기가 만들어집니다. 단순한 모사를 넘어 사물 사이의 긴장감과 고요한 공기를 포착하는 수업입니다.",
    imageUrl: "/src/assets/images/art_studio_still_life_1795138461821.jpg",
    imageAlt: "창가의 부드러운 자연광 아래 놓인 도자기 주전자와 유칼립투스 가지 정물 사진",
    openingQuestion:
      "창가 정물을 관찰할 때 가장 먼저 눈에 들어온 것은 무엇인가요? 도자기의 매끈한 곡선, 아니면 천 주름이 만드는 부드러운 그림자 중 어떤 부분에 주인공 자리를 주고 싶나요?",
    quickReplies: [
      "도자기 표면의 빛과 그림자 대비를 강조하고 싶어요",
      "마른 식물의 가느다란 선을 리듬감 있게 살려볼래요",
      "구도를 좀 더 가까이 당겨서 그려보고 싶어요",
    ],
    concept: {
      gradeLevel: "중학생",
      medium: "연필·목탄 소묘",
      theme: "창가 빛 아래의 정물과 시간의 결",
      title: "북향 창가의 고요한 정물",
      artistStatement: "자연광이 도자기와 주름진 천을 스치며 만들어내는 부드러운 명암의 온도를 관찰해 기록합니다.",
      subject: "유약을 바르지 않은 도자기 주전자, 유칼립투스 가지, 자연스럽게 구겨진 린넨 천",
      moodKeywords: ["고요한", "자연광", "질감 대비"],
      compositionType: "rule_of_thirds",
      compositionNote: "도자기 몸통을 삼분할 우측 아래 교차점에 두고, 나뭇가지가 왼쪽 위 여백으로 자연스럽게 뻗어가게 배치합니다.",
      materials: ["4절 소묘지", "HB·2B·4B 연필", "찰필 또는 휴지", "떡지우개"],
      colorPalette: [
        { name: "스톤 아이보리", hex: "#E7E2D8", role: "주조색" },
        { name: "세이지 그레이", hex: "#7C877E", role: "보조색" },
        { name: "테라 베이지", hex: "#B59E84", role: "보조색" },
        { name: "차콜 블랙", hex: "#27272A", role: "강조색" },
      ],
      steps: [
        { id: "s1", label: "화면에서 가장 밝은 하이라이트와 가장 어두운 그림자 2곳 먼저 표시하기", done: false },
        { id: "s2", label: "도자기 좌우 대칭축과 타원 기울기 정확히 잡기", done: false },
        { id: "s3", label: "천 주름은 선을 다 그리지 말고 큰 면의 명암으로 덩어리 잡기", done: false },
        { id: "s4", label: "잎사귀 앞뒤 겹침과 떡지우개로 빛 반사 정리하기", done: false },
      ],
    },
  },
  {
    id: "landscape-twilight-memory",
    category: "기억·풍경화",
    gradeLevel: "고등학생",
    medium: "수채화",
    theme: "하루 중 가장 기억에 남는 빛의 순간",
    title: "해 질 녘 항구 마을의 불빛",
    summary: "차갑게 가라앉는 코발트빛 하늘과 물 위에 번지는 따뜻한 창문 불빛의 보색 대비를 활용해, 장소가 가진 정서와 시간의 흐름을 수채·과슈로 표현합니다.",
    imageUrl: "/src/assets/images/art_landscape_memory_1795138462384.jpg",
    imageAlt: "코발트 블루 하늘과 따뜻한 주황빛 창문 반사가 어우러진 황혼 항구 마을 수채화",
    openingQuestion:
      "내가 기억하는 하루의 특정 시간대는 언제인가요? 해가 막 지기 직전의 푸른 어스름처럼, 색의 온도 차이로 감정을 전달해 볼 수 있을까요?",
    quickReplies: [
      "비 온 뒤 젖은 길에 반사되는 가로등을 그리고 싶어요",
      "차가운 파랑과 따뜻한 노랑의 대비를 써보고 싶어요",
      "우리 동네 골목길의 저녁 풍경으로 바꿔보고 싶어요",
    ],
    concept: {
      gradeLevel: "고등학생",
      medium: "수채화",
      theme: "하루 중 가장 기억에 남는 빛의 순간",
      title: "푸른 어스름과 작은 불빛들",
      artistStatement: "차가운 밤공기가 내려앉는 순간 켜지는 작은 창문의 온기를 한난 대비로 담아냅니다.",
      subject: "언덕을 따라 이어진 지붕들, 수면 위에 길게 흔들리는 주황빛 조명 반사",
      moodKeywords: ["한난 대비", "아련한", "빛의 반사"],
      compositionType: "diagonal",
      compositionNote: "왼쪽 아래 부두에서 오른쪽 위 언덕 마을로 시선이 대각선을 따라 자연스럽게 올라가도록 설계합니다.",
      materials: ["300g 중목 수채화지", "수채 물감 및 화이트 과슈", "평붓·세필 붓", "마스킹 테이프"],
      colorPalette: [
        { name: "딥 울트라마린", hex: "#1E3A8A", role: "주조색" },
        { name: "슬레이트 인디고", hex: "#334155", role: "보조색" },
        { name: "트와일라잇 라벤더", hex: "#8B8BAE", role: "보조색" },
        { name: "랜턴 앰버", hex: "#F59E0B", role: "강조색" },
      ],
      steps: [
        { id: "s1", label: "수평선과 건물들의 큰 실루엣만 연하게 스케치하기", done: false },
        { id: "s2", label: "물에 충분히 적신 종이에 하늘과 물의 그라데이션 먼저 칠하기", done: false },
        { id: "s3", label: "종이가 마른 뒤 어두운 건물 실루엣과 배의 형태 올리기", done: false },
        { id: "s4", label: "물결 사이로 끊어지는 따뜻한 불빛 반사 터치로 마무리하기", done: false },
      ],
    },
  },
  {
    id: "mixed-media-collage",
    category: "현대 미술·혼합매체",
    gradeLevel: "중학생",
    medium: "콜라주·혼합매체",
    theme: "종이의 결로 표현하는 내면의 지형",
    title: "찢어진 종이와 목탄의 리듬",
    summary: "완벽하게 그려야 한다는 부담을 내려놓고, 손으로 종이를 찢고 겹치며 우연한 선과 번짐 속에서 나만의 추상 풍경을 발견하는 실험 수업입니다.",
    imageUrl: "/src/assets/images/art_collage_mixed_media_1795138461696.jpg",
    imageAlt: "찢어진 무채색 종이와 목탄 선, 울트라마린 잉크 번짐이 어우러진 현대 콜라주 작품",
    openingQuestion:
      "최근에 느꼈던 감정(예: 설렘, 차분함, 복잡한 생각)을 산이나 파도 같은 자연의 지형에 비유한다면 어떤 모양과 질감일까요?",
    quickReplies: [
      "거칠게 찢어진 단면과 진한 먹물 번짐을 섞어보고 싶어요",
      "차분한 회색 톤 위에 파란색 한 가지만 포인트로 쓰고 싶어요",
      "추상 형태 안에 작은 상징 그림을 숨겨 넣고 싶어요",
    ],
    concept: {
      gradeLevel: "중학생",
      medium: "콜라주·혼합매체",
      theme: "종이의 결로 표현하는 내면의 지형",
      title: "겹쳐진 시간의 능선",
      artistStatement: "손으로 찢은 종이의 거친 섬유질과 즉흥적인 목탄 선, 푸른 잉크의 번짐을 겹쳐 마음의 결을 시각화합니다.",
      subject: "레이어를 이룬 미네랄 톤 종이 조각들, 자유로운 목탄 윤곽선, 한쪽 흐름을 타고 번진 잉크",
      moodKeywords: ["우연성", "레이어", "추상적 리듬"],
      compositionType: "horizon",
      compositionNote: "중앙을 가로지르는 종이 층의 높낮이에 변화를 주고, 사방에 숨 쉴 수 있는 넉넉한 종이 여백을 남깁니다.",
      materials: ["두꺼운 한지 및 색지 조각", "목탄 또는 오일 파스텔", "청색 수성 잉크/물감", "목공풀"],
      colorPalette: [
        { name: "코튼 화이트", hex: "#EAE6DF", role: "주조색" },
        { name: "스모크 그레이", hex: "#6B7280", role: "보조색" },
        { name: "어스 브라운", hex: "#574C43", role: "보조색" },
        { name: "프러시안 블루", hex: "#0F2F6B", role: "강조색" },
      ],
      steps: [
        { id: "s1", label: "3~4종류의 종이를 가위 대신 손으로 찢어 다양한 곡선 만들기", done: false },
        { id: "s2", label: "풀칠하기 전에 바탕 종이 위에서 여러 겹으로 배치 실험하기", done: false },
        { id: "s3", label: "종이를 붙인 뒤 경계선을 가로지르는 힘 있는 목탄 선 긋기", done: false },
        { id: "s4", label: "물기를 머금은 붓으로 강조색 잉크를 한쪽 흐름에 자연스럽게 번지게 하기", done: false },
      ],
    },
  },
  {
    id: "sculpture-organic-forms",
    category: "입체·공예",
    gradeLevel: "초등 고학년",
    medium: "조소·입체 조형",
    theme: "손끝으로 빚는 나만의 작은 건축물과 형태",
    title: "아치와 고리가 있는 점토 마케트",
    summary: "평면 스케치를 넘어 흙의 무게와 빈 공간(네거티브 스페이스)을 직접 만지며, 360도 어느 방향에서 보아도 균형 잡힌 입체 조형을 구상합니다.",
    imageUrl: "/src/assets/images/art_sculpture_ceramic_1795138462061.jpg",
    imageAlt: "작업대 위에 놓인 테라코타와 백자토 점토 입체 조형물과 조각 도구",
    openingQuestion:
      "점토를 빚을 때 덩어리 자체만큼 중요한 것이 '구멍이나 빈 공간'이에요. 빛이 통과할 수 있는 작은 아치나 구멍을 만든다면 어떤 모양이 재미있을까요?",
    quickReplies: [
      "여러 층을 쌓아 올린 탑 모양 조형을 만들고 싶어요",
      "둥근 아치와 고리가 서로 연결된 형태를 해볼래요",
      "동물의 움직임을 단순화한 덩어리로 표현하고 싶어요",
    ],
    concept: {
      gradeLevel: "초등 고학년",
      medium: "조소·입체 조형",
      theme: "손끝으로 빚는 나만의 작은 건축물과 형태",
      title: "빛이 통과하는 작은 조형",
      artistStatement: "단순한 기하학적 형태와 손으로 빚은 부드러운 곡선을 조합해 빈 공간의 아름다움을 탐구합니다.",
      subject: "아치형 문, 꼬임이 있는 고리 형태, 흙 띠(코일)를 쌓아 올린 기둥 조합",
      moodKeywords: ["촉각적", "빈 공간", "균형감"],
      compositionType: "centered",
      compositionNote: "바닥면이 안정적으로 서도록 무게중심을 아래에 두고, 위쪽으로 갈수록 뚫린 공간과 곡선이 가볍게 열리게 만듭니다.",
      materials: ["테라코타 점토 또는 지점토", "나무 조각도·철사 헤라", "물 스펀지", "작업용 합판"],
      colorPalette: [
        { name: "테라코타 클레이", hex: "#A85634", role: "주조색" },
        { name: "포슬린 화이트", hex: "#ECE8DF", role: "보조색" },
        { name: "내추럴 버치", hex: "#C8A986", role: "보조색" },
        { name: "슬레이트 스톤", hex: "#475569", role: "강조색" },
      ],
      steps: [
        { id: "s1", label: "앞·옆·위에서 본 간단한 입체 아이디어를 종이에 먼저 그리기", done: false },
        { id: "s2", label: "점토를 손바닥으로 치대어 공기를 빼고 기본 덩어리 만들기", done: false },
        { id: "s3", label: "코일링이나 판 성형으로 이어 붙일 때 물칠(흙물)로 꼼꼼히 접합하기", done: false },
        { id: "s4", label: "사방에서 돌려보며 쓰러지지 않는지 균형 확인하고 표면 다듬기", done: false },
      ],
    },
  },
];
