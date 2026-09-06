import { assetUrl } from '../lib/assetUrl'

const rawWorkCategories = [
  {
    number: '01',
    slug: 'brand',
    title: '品牌视觉设计',
    en: 'Brand Visual',
    description: '围绕品牌定位建立识别系统、视觉语言与跨媒介一致性。',
    theme: { accent: '#d0ad7d', glow: 'rgba(208,173,125,.22)' },
    projects: [
      {
        id: 'brand-01',
        title: '深圳市细胞治疗技术协会VIS',
        meta: 'IDENTITY · VISUAL SYSTEM',
        cover: '/work/brand-01/cover.webp',
        media: [
          {
            type: 'image',
            src: '/work/brand-01/detail-01.webp',
            alt: '深圳市细胞治疗技术协会视觉识别系统作品详情',
          },
        ],
      },
    ],
  },
  {
    number: '02',
    slug: 'ecommerce',
    title: '产品视觉设计',
    en: 'Product Visual',
    description: '面向营销节点与转化场景，组织高效、有节奏的商业视觉。',
    theme: { accent: '#a9676b', glow: 'rgba(121,60,64,.22)' },
    projects: [
      {
        id: 'ecommerce-01',
        title: 'RÖT KRÖN 陶瓷音腔耳机',
        meta: 'CAMPAIGN · E-COMMERCE',
        cover: '/work/ecommerce-01/cover.webp',
        media: [
          {
            type: 'image',
            src: '/work/ecommerce-01/detail-01.webp',
            alt: 'RÖT KRÖN 陶瓷音腔耳机电商视觉详情',
          },
        ],
      },
      {
        id: 'ecommerce-02',
        title: '瑞美亚精华液',
        meta: 'CAMPAIGN · E-COMMERCE',
        cover: '/work/ecommerce-02/cover.webp',
        media: [
          {
            type: 'image',
            src: '/work/ecommerce-02/detail-01.webp',
            alt: '瑞美亚精华液电商视觉详情',
          },
        ],
      },
      {
        id: 'ecommerce-03',
        title: 'AOC K1S Ultra 投影仪',
        meta: 'CAMPAIGN · E-COMMERCE',
        cover: '/work/ecommerce-03/cover.webp',
        media: [
          {
            type: 'image',
            src: '/work/ecommerce-03/detail-01.webp',
            alt: 'AOC K1S Ultra 投影仪电商视觉详情',
          },
        ],
      },
    ],
  },
  {
    number: '03',
    slug: 'packaging',
    title: '包装与物料延展',
    en: 'Packaging',
    description: '从包装结构到线下物料，延展品牌触点与产品体验。',
    theme: { accent: '#bd9568', glow: 'rgba(166,112,65,.22)' },
    projects: [
      {
        id: 'packaging-01',
        title: '瑞美亚面膜包装',
        meta: 'PACKAGING · MASK',
        cover: '/work/packaging-01/cover.webp',
        media: [
          {
            type: 'image',
            src: '/work/packaging-01/detail-01.webp',
            alt: '瑞美亚面膜包装作品详情',
          },
        ],
      },
      {
        id: 'packaging-02',
        title: '默赛尔企业画册',
        meta: 'EDITORIAL · BROCHURE',
        cover: '/work/packaging-02/cover.webp',
        media: [
          {
            type: 'image',
            src: '/work/packaging-02/detail-01.webp',
            alt: '默赛尔企业画册作品详情',
          },
        ],
      },
    ],
  },
  {
    number: '04',
    slug: '3d',
    title: '三维视觉表现',
    en: '3D Visual',
    description: '以三维建模、材质与动态表达扩展视觉想象力。',
    theme: { accent: '#93879a', glow: 'rgba(110,90,122,.22)' },
    projects: [
      {
        id: '3d-01',
        title: '瑞美亚多效修复霜三维视觉',
        meta: '3D · PRODUCT VISUAL',
        cover: '/work/3d-01/cover.webp',
        media: [
          {
            type: 'image',
            src: '/work/3d-01/process-white.webp',
            alt: '瑞美亚多效修复霜三维白模过程图',
          },
          {
            type: 'image',
            src: '/work/3d-01/render.webp',
            alt: '瑞美亚多效修复霜三维成品渲染图',
          },
          {
            type: 'video',
            src: '/work/3d-01/video.mp4',
            poster: '/work/3d-01/cover.webp',
          },
        ],
      },
    ],
  },
  {
    number: '05',
    slug: 'aigc-video',
    title: 'AIGC视频广告',
    en: 'AIGC Video Advertising',
    description: '结合生成式影像、动态设计与广告叙事，探索更高效、更具想象力的视频表达。',
    theme: { accent: '#a98ca8', glow: 'rgba(126,82,126,.24)' },
    projects: [
      {
        id: 'aigc-video-01',
        title: '瑞美亚精华液广告',
        meta: 'AIGC · BEAUTY AD',
        cover: '/work/aigc-video-01/cover.webp',
        media: [
          {
            type: 'video',
            src: 'https://github.com/ygystyrdqd-lab/tingting-portfolio/releases/download/media-v1/aigc-video-01.mp4',
            poster: '/work/aigc-video-01/cover.webp',
          },
        ],
      },
      {
        id: 'aigc-video-02',
        title: 'AOC激光投影广告',
        meta: 'AIGC · PRODUCT AD',
        cover: '/work/aigc-video-02/cover.webp',
        media: [
          {
            type: 'video',
            src: 'https://github.com/ygystyrdqd-lab/tingting-portfolio/releases/download/media-v1/aigc-video-02.mp4',
            poster: '/work/aigc-video-02/cover.webp',
          },
        ],
      },
    ],
  },
]

const rawFeaturedWorkCategories = [
  {
    number: '01',
    slug: 'ip-visual',
    title: 'IP视觉设计',
    en: 'IP Visual Design',
    description: '围绕角色设定与品牌性格，建立可持续延展的IP视觉系统。',
    theme: { accent: '#d0ad7d', glow: 'rgba(208,173,125,.22)' },
    projects: [
      {
        id: 'ip-visual-01',
        title: '花小灵IP形象设计',
        meta: 'IP · CHARACTER SYSTEM',
        cover: '/work/ip-visual-01/cover.webp',
        media: [
          { type: 'image', src: '/work/ip-visual-01/detail-01.webp', alt: '花小灵IP形象设计作品详情' },
        ],
      },
    ],
  },
  {
    number: '02',
    slug: 'campaign-visual',
    title: '电商与活动视觉',
    en: 'Campaign Visual',
    description: '面向电商转化与活动传播，组织清晰、有节奏的商业视觉。',
    theme: { accent: '#a9676b', glow: 'rgba(121,60,64,.22)' },
    projects: [
      {
        id: 'campaign-visual-01',
        title: 'AOC投影仪电商视觉',
        meta: 'CAMPAIGN · E-COMMERCE',
        cover: '/work/campaign-visual-01/cover.webp',
        media: [
          { type: 'image', src: '/work/campaign-visual-01/detail-01.webp', alt: 'AOC投影仪电商视觉首图一' },
          { type: 'image', src: '/work/campaign-visual-01/detail-02.webp', alt: 'AOC投影仪电商视觉首图二' },
          { type: 'image', src: '/work/campaign-visual-01/detail-03.webp', alt: 'AOC投影仪电商视觉长页详情' },
        ],
      },
    ],
  },
  {
    number: '03',
    slug: 'aigc-workflow',
    title: 'AIGC工作流',
    en: 'AIGC Workflow',
    description: '将生成式工具融入创意、制作与迭代流程，拓展视觉表达效率。',
    theme: { accent: '#a98ca8', glow: 'rgba(126,82,126,.24)' },
    projects: [
      {
        id: 'aigc-workflow-01',
        title: 'AI空间场景生成工作流',
        meta: 'AIGC · CREATIVE WORKFLOW',
        cover: '/work/aigc-workflow-01/cover.webp',
        media: [
          { type: 'image', src: '/work/aigc-workflow-01/detail-01.webp', alt: 'AI空间场景生成与合成工作流详情' },
        ],
      },
    ],
  },
]

const resolveCategoryAssets = (categories) => categories.map((category) => ({
  ...category,
  projects: category.projects.map((project) => ({
    ...project,
    cover: project.cover ? assetUrl(project.cover) : project.cover,
    media: project.media.map((item) => ({
      ...item,
      src: assetUrl(item.src),
      ...(item.poster ? { poster: assetUrl(item.poster) } : {}),
    })),
  })),
}))

export const workCategories = resolveCategoryAssets(rawWorkCategories)
export const featuredWorkCategories = resolveCategoryAssets(rawFeaturedWorkCategories)

const allWorkCategories = [...workCategories, ...featuredWorkCategories]

export const getWorkCategory = (slug) => allWorkCategories.find((category) => category.slug === slug)
