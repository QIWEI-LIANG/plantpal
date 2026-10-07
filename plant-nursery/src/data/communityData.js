export const friendData = [
  {
    id: 'mia',
    name: 'Mia Chen',
    initials: 'MC',
    color: 'peach',
    bio: { zh: '在小阳台种一片森林', en: 'A little forest on my balcony' },
    plants: [
      { plantId: 'monstera', status: 'check' },
      { plantId: 'peace', status: 'done' },
    ],
  },
  {
    id: 'alex',
    name: 'Alex Lin',
    initials: 'AL',
    color: 'sage',
    bio: { zh: '你的示例代管伙伴', en: 'Your example plant sitter' },
    plants: [
      { plantId: 'snake', status: 'done' },
      { plantId: 'pothos', status: 'check' },
    ],
  },
  {
    id: 'sam',
    name: 'Sam Wu',
    initials: 'SW',
    color: 'lavender',
    bio: { zh: '花店日常，慢慢生长', en: 'Florist life, one leaf at a time' },
    plants: [
      { plantId: 'rubber', status: 'done' },
      { plantId: 'zz', status: 'done' },
    ],
  },
]

export const postData = [
  {
    id: 'post-1',
    author: 'Mia Chen',
    initials: 'MC',
    color: 'peach',
    date: '2026-10-06T09:20:00+08:00',
    likes: 24,
    tag: { zh: '新手日记', en: 'Beginner journal' },
    title: {
      zh: '第一片新叶，是这个秋天的小惊喜',
      en: 'My first new leaf. A little autumn surprise.',
    },
    body: {
      zh: '养龟背竹的第一个月，我开始记录每次检查和浇水。慢慢观察，比着急做什么更有帮助。你们的第一株植物是什么？',
      en: 'One month with my monstera. I started recording each check and watering. Taking time to observe has been helpful. What was your first plant?',
    },
  },
  {
    id: 'post-2',
    author: 'Sam Wu',
    initials: 'SW',
    color: 'lavender',
    date: '2026-10-05T16:45:00+08:00',
    likes: 38,
    tag: { zh: '养护分享', en: 'Care notes' },
    title: {
      zh: '浇水前，先和你的植物打个招呼',
      en: 'Say hello to your plant before you water.',
    },
    body: {
      zh: '我在花店会先摸摸土壤，再看看叶片和花盆排水。有时候，今天的最佳养护就是暂时不浇水。分享一下你的检查习惯吧。',
      en: 'At the shop, I check the soil, leaves, and pot drainage first. Sometimes the best care for today is holding off watering. What does your check-in look like?',
    },
  },
  {
    id: 'post-3',
    author: 'Alex Lin',
    initials: 'AL',
    color: 'sage',
    date: '2026-10-04T11:10:00+08:00',
    likes: 16,
    tag: { zh: '植物代管', en: 'Plant sitting' },
    title: {
      zh: '帮朋友照顾植物，我最想知道这三件事',
      en: 'Three things I want to know when plant sitting.',
    },
    body: {
      zh: '植物平时放在哪里、主人有什么特别说明、最近一次做了什么。把这些放在一起，代管就安心多了。',
      en: 'Where the plant belongs, the owner’s instructions, and what happened last time. Having all three in one place makes plant sitting easier.',
    },
  },
]
