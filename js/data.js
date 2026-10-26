// 테마 및 캐릭터 데이터베이스
// 테마별 캐릭터 목록을 공통된 데이터 구조로 관리하며,
// 9번 '전체 캐릭터 모음'은 1~8번 테마의 캐릭터를 자동으로 병합하여 구성합니다.

export const INDIVIDUAL_THEMES = [
  {
    id: 'pokemon',
    title: '포켓몬',
    sub: 'Pokemon Adventure',
    color: '#FFCB05',
    accentColor: '#3B4CCA',
    bgGradient: 'linear-gradient(135deg, #FF5350 0%, #FFCB05 100%)',
    badge: '⚡ 모험과 배틀',
    bgmDesc: '신나는 포켓몬 모험풍 멜로디',
    bgmType: 'pokemon',
    icon: 'fa-bolt',
    characters: [
      { id: 'pikachu', name: '피카츄', model: 'pikachu', color: '#FDD835', eyeColor: '#212121', cheekColor: '#E53935' },
      { id: 'charmander', name: '파이리', model: 'charmander', color: '#FF7043', eyeColor: '#00ACC1', cheekColor: '#FFB74D' },
      { id: 'squirtle', name: '꼬부기', model: 'squirtle', color: '#4FC3F7', eyeColor: '#6D4C41', cheekColor: '#B2EBF2' },
      { id: 'bulbasaur', name: '이상해씨', model: 'bulbasaur', color: '#4DB6AC', eyeColor: '#C2185B', cheekColor: '#00897B' },
      { id: 'jigglypuff', name: '푸린', model: 'jigglypuff', color: '#F8BBD0', eyeColor: '#00BCD4', cheekColor: '#EC407A' },
      { id: 'eevee', name: '이브이', model: 'eevee', color: '#A1887F', eyeColor: '#4E342E', cheekColor: '#D7CCC8' }
    ]
  },
  {
    id: 'sanrio',
    title: '산리오',
    sub: 'Sanrio Friends',
    color: '#FF69B4',
    accentColor: '#BA68C8',
    bgGradient: 'linear-gradient(135deg, #FF94B9 0%, #F48FB1 100%)',
    badge: '🎀 귀엽고 사랑스러운',
    bgmDesc: '달콤하고 반짝이는 벨/마림바',
    bgmType: 'sanrio',
    icon: 'fa-heart',
    characters: [
      { id: 'hellokitty', name: '헬로키티', model: 'hellokitty', color: '#FFFFFF', eyeColor: '#212121', bowColor: '#E91E63' },
      { id: 'mymelody', name: '마이멜로디', model: 'mymelody', color: '#FF80AB', eyeColor: '#212121', bowColor: '#FFFFFF' },
      { id: 'kuromi', name: '쿠로미', model: 'kuromi', color: '#424242', eyeColor: '#E91E63', skullColor: '#EC407A' },
      { id: 'cinnamoroll', name: '시나모롤', model: 'cinnamoroll', color: '#E1F5FE', eyeColor: '#0288D1', cheekColor: '#FFCDD2' },
      { id: 'pompompurin', name: '폼폼푸린', model: 'pompompurin', color: '#FFF59D', eyeColor: '#4E342E', hatColor: '#5D4037' },
      { id: 'pochacco', name: '포차코', model: 'pochacco', color: '#FFFFFF', eyeColor: '#212121', earColor: '#212121' }
    ]
  },
  {
    id: 'shinchan',
    title: '짱구는 못말려',
    sub: 'Crayon Shin-chan',
    color: '#E53935',
    accentColor: '#FDD835',
    bgGradient: 'linear-gradient(135deg, #FF5252 0%, #FFEB3B 100%)',
    badge: '🍫 엉뚱발랄 코믹',
    bgmDesc: '익살스럽고 신나는 브라스 튠',
    bgmType: 'shinchan',
    icon: 'fa-face-laugh-squint',
    characters: [
      { id: 'shinchan', name: '신짱구', model: 'shinchan', color: '#FFEB3B', shirtColor: '#E53935', pantsColor: '#FDD835' },
      { id: 'shiro', name: '흰둥이', model: 'shiro', color: '#FAFAFA', collarColor: '#0288D1' },
      { id: 'buriburi', name: '부리부리자에몬', model: 'buriburi', color: '#F48FB1', swordColor: '#B0BEC5' },
      { id: 'himawari', name: '짱아', model: 'himawari', color: '#FFE082', hairColor: '#FB8C00' },
      { id: 'actionkamen', name: '액션가면', model: 'actionkamen', color: '#00897B', maskColor: '#E53935' }
    ]
  },
  {
    id: 'disney',
    title: '디즈니',
    sub: 'Disney Magic',
    color: '#1E88E5',
    accentColor: '#FFD700',
    bgGradient: 'linear-gradient(135deg, #1A237E 0%, #3949AB 100%)',
    badge: '✨ 꿈과 마법의 세계',
    bgmDesc: '환상적이고 웅장한 오르골 왈츠',
    bgmType: 'disney',
    icon: 'fa-wand-magic-sparkles',
    characters: [
      { id: 'mickey', name: '미키 마우스', model: 'mickey', color: '#212121', pantsColor: '#E53935' },
      { id: 'donald', name: '도널드 덕', model: 'donald', color: '#FFFFFF', beakColor: '#FFA000', hatColor: '#1976D2' },
      { id: 'pooh', name: '곰돌이 푸', model: 'pooh', color: '#FFB300', shirtColor: '#D32F2F' },
      { id: 'stitch', name: '스티치', model: 'stitch', color: '#1E88E5', earColor: '#F48FB1' },
      { id: 'olaf', name: '올라프', model: 'olaf', color: '#ECEFF1', noseColor: '#FF6F00' }
    ]
  },
  {
    id: 'ghibli',
    title: '지브리 캐릭터',
    sub: 'Studio Ghibli',
    color: '#43A047',
    accentColor: '#8D6E63',
    bgGradient: 'linear-gradient(135deg, #2E7D32 0%, #81C784 100%)',
    badge: '🍃 따뜻한 자연의 감성',
    bgmDesc: '서정적이고 따스한 피아노 플루트',
    bgmType: 'ghibli',
    icon: 'fa-seedling',
    characters: [
      { id: 'totoro', name: '토토로', model: 'totoro', color: '#78909C', bellyColor: '#ECEFF1' },
      { id: 'chibitotoro', name: '꼬마 토토로', model: 'chibitotoro', color: '#FFFFFF', leafColor: '#4CAF50' },
      { id: 'noface', name: '가오나시', model: 'noface', color: '#263238', maskColor: '#ECEFF1' },
      { id: 'susuwatari', name: '먼지귀신', model: 'susuwatari', color: '#212121', candyColor: '#FF80AB' },
      { id: 'jiji', name: '지지', model: 'jiji', color: '#212121', bowColor: '#E53935' }
    ]
  },
  {
    id: 'game',
    title: '게임 캐릭터',
    sub: 'Game Heroes',
    color: '#8E24AA',
    accentColor: '#00E676',
    bgGradient: 'linear-gradient(135deg, #4A148C 0%, #7B1FA2 100%)',
    badge: '🎮 박진감 넘치는 영웅',
    bgmDesc: '레트로 칩튠과 박진감 넘치는 비트',
    bgmType: 'game',
    icon: 'fa-gamepad',
    characters: [
      { id: 'mario', name: '마리오', model: 'mario', hatColor: '#E53935', overallsColor: '#1976D2' },
      { id: 'sonic', name: '소닉', model: 'sonic', color: '#1976D2', shoesColor: '#E53935' },
      { id: 'kirby', name: '커비', model: 'kirby', color: '#FF80AB', cheekColor: '#E91E63' },
      { id: 'pacman', name: '팩맨', model: 'pacman', color: '#FFEB3B', mouthColor: '#212121' },
      { id: 'slime', name: '드퀘 슬라임', model: 'slime', color: '#03A9F4', eyeColor: '#212121' },
      { id: 'megaman', name: '록맨', model: 'megaman', color: '#00BCD4', helmetColor: '#0D47A1' }
    ]
  },
  {
    id: 'chiikawa',
    title: '치이카와',
    sub: 'Chiikawa Friends',
    color: '#FFB6C1',
    accentColor: '#80DEEA',
    bgGradient: 'linear-gradient(135deg, #FFD1DC 0%, #FFF0F5 100%)',
    badge: '🌸 포근포근 힐링',
    bgmDesc: '몽환적이고 아기자기한 오르골 팝',
    bgmType: 'chiikawa',
    icon: 'fa-paw',
    characters: [
      { id: 'chiikawa', name: '치이카와', model: 'chiikawa', color: '#FFFFFF', cheekColor: '#FF8A80', earColor: '#FFFFFF' },
      { id: 'hachiware', name: '하치와레', model: 'hachiware', color: '#FFFFFF', patternColor: '#42A5F5' },
      { id: 'usagi', name: '우사기', model: 'usagi', color: '#FFF59D', cheekColor: '#FF8A80' },
      { id: 'kurimanju', name: '쿠리만쥬', model: 'kurimanju', color: '#D7CCC8', headColor: '#8D6E63' },
      { id: 'momonga', name: '모몽가', model: 'momonga', color: '#ECEFF1', tailColor: '#90CAF9' }
    ]
  },
  {
    id: 'rilakkuma',
    title: '리락쿠마',
    sub: 'Relax Bear & Friends',
    color: '#8D6E63',
    accentColor: '#FFD54F',
    bgGradient: 'linear-gradient(135deg, #A1887F 0%, #D7CCC8 100%)',
    badge: '☕ 나른하고 편안한',
    bgmDesc: '따스하고 여유로운 로파이 재즈 왈츠',
    bgmType: 'rilakkuma',
    icon: 'fa-mug-hot',
    characters: [
      { id: 'rilakkuma', name: '리락쿠마', model: 'rilakkuma', color: '#8D6E63', earInsideColor: '#FFD54F', muzzleColor: '#FFF8E1' },
      { id: 'korilakkuma', name: '코리락쿠마', model: 'korilakkuma', color: '#FFF8E1', earInsideColor: '#FF80AB', buttonColor: '#D32F2F' },
      { id: 'kiiroitori', name: '키이로이토리', model: 'kiiroitori', color: '#FFEB3B', beakColor: '#FF9800', hairColor: '#212121' },
      { id: 'chairoikoguma', name: '차이로이코구마', model: 'chairoikoguma', color: '#5D4037', chestColor: '#FFFFFF' }
    ]
  }
];

// 9번: 전체 캐릭터 모음 (1~8번 테마의 모든 캐릭터를 자동 병합)
export const ALL_THEME = {
  id: 'all',
  title: '전체 캐릭터 모음',
  sub: 'All-Star Arcade Party',
  color: '#FF007F',
  accentColor: '#00E5FF',
  bgGradient: 'linear-gradient(135deg, #FF007F 0%, #7928CA 50%, #0070F3 100%)',
  badge: '🎉 모든 테마 총출동!',
  bgmDesc: '신나고 경쾌한 페스티벌 아케이드 댄스 튠',
  bgmType: 'all',
  icon: 'fa-crown',
  characters: INDIVIDUAL_THEMES.flatMap(theme =>
    theme.characters.map(char => ({
      ...char,
      themeId: theme.id,
      themeTitle: theme.title
    }))
  )
};

// 전체 9개 테마 목록
export const ALL_THEMES = [...INDIVIDUAL_THEMES, ALL_THEME];

// 당첨 축하 문구 목록
export const CELEBRATION_MESSAGES = [
  '너 당첨!',
  '축하합니다!',
  '오늘의 주인공!',
  '행운의 신이 선택한 사람!',
  '기적의 집게손! 대박 당첨!',
  '골든 티켓의 주인공은 바로 너!',
  '오늘 커피 쏠 사람 탄생?! ☕',
  '완벽한 크레인 캐치 성공!',
  '오늘 밤 파티의 주인공 등극! ✨',
  '신의 손놀림으로 인형 획득!',
  '운명은 너를 향해 있었다!'
];
