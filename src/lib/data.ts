export interface University {
  slug: string;
  name: string;
  nameCn: string;
  city: string;
  cityCn: string;
  ranking: number;
  rating: number;
  type: string;
  typeCn: string;
  established: number;
  students: string;
  intlStudents: string;
  description: string;
  descriptionCn: string;
  popularPrograms: string[];
  popularProgramsCn: string[];
  tuitionUndergrad: string;
  tuitionGraduate: string;
  intake: string;
  intakeCn: string;
  disciplines: string[];
  image: string;
  logo: string;
  qsRanking: string;
  qsWorldRanking: number;
  tags: string[];
  tagsCn: string[];
  accommodation: string;
  accommodationCn: string;
  accommodationCost: string;
  accommodationCostCn: string;
  accommodationTypes: string[];
  accommodationTypesCn: string[];
  gallery: string[];
  highlights: {
    en: string[];
    zh: string[];
  };
  /**
   * University-specific scholarship narrative. Optional — most rows
   * use the program-level `scholarshipAvailable` flag instead, which
   * is auto-rendered in the Scholarships tab. This free-text field
   * is for the longer "Tsinghua's named scholarship portfolio
   * includes..." narrative.
   */
  scholarshipInfo?: string;
  scholarshipInfoCn?: string;
  /**
   * Next application deadline (ISO 8601 date string, e.g. "2026-05-31").
   * Powers the live countdown timer on the detail page hero. If
   * unset, the page falls back to a static "Applications open until
   * [intake]" message.
   */
  applicationDeadline?: string;
}

export const universities: University[] = [
  {
    slug: 'tsinghua-university',
    name: 'Tsinghua University',
    nameCn: '清华大学',
    city: 'Beijing',
    cityCn: '北京',
    ranking: 1,
    rating: 4.9,
    type: 'Public University',
    typeCn: '公立大学',
    established: 1911,
    students: '50,000+',
    intlStudents: '4,000+',
    description: 'Tsinghua University is a major research university in Beijing, and a member of the C9 League. It is consistently ranked as the top university in China and one of the leading universities in the Asia-Pacific region. Known for its engineering and computer science programs, Tsinghua has produced many notable alumni including political leaders and tech entrepreneurs.',
    descriptionCn: '清华大学是中国顶尖研究型大学，C9联盟成员，常年位居中国大学排名第一。以工程和计算机科学项目著称，培养了众多政界领袖和科技企业家。',
    popularPrograms: ['Computer Science', 'Electronic Engineering', 'Business Administration', 'Architecture', 'Economics'],
    popularProgramsCn: ['计算机科学', '电子工程', '工商管理', '建筑学', '经济学'],
    tuitionUndergrad: '¥23,000 - 30,000/yr',
    tuitionGraduate: '¥25,000 - 40,000/yr',
    intake: 'September (Fall), March (Spring)',
    intakeCn: '9月（秋季），3月（春季）',
    disciplines: ['Engineering', 'Computer Science', 'Business', 'Architecture'],
    image: 'https://images.unsplash.com/photo-1595437193398-f24279553f4f?w=800&q=80',
    logo: '',
    qsRanking: '#20 QS World 2025',
    qsWorldRanking: 20,
    tags: ['985', '211', 'Double First Class'],
    tagsCn: ['985工程', '211工程', '双一流'],
    accommodation: 'Tsinghua offers modern on-campus dormitories for international students, including single and double rooms with air conditioning, private bathrooms, and Wi-Fi. The international student dormitory (Zijing Apartment) provides 24-hour hot water, laundry facilities, and shared kitchens. Off-campus housing is also available nearby.',
    accommodationCn: '清华大学为国际学生提供现代化校内宿舍，包括单人间和双人间，配备空调、独立卫浴和Wi-Fi。紫荆公寓国际学生宿舍提供24小时热水、洗衣设施和公共厨房。校外住宿也可选择。',
    accommodationCost: '¥800 - 2,500/month',
    accommodationCostCn: '¥800 - 2,500/月',
    accommodationTypes: ['Single Room', 'Double Room', 'International Student Dorm'],
    accommodationTypesCn: ['单人间', '双人间', '留学生公寓'],
    applicationDeadline: '2026-07-15',
    gallery: [
      'https://images.unsplash.com/photo-1595437193398-f24279553f4f?w=800&q=80',
      'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80',
      'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=800&q=80',
      'https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=800&q=80',
    ],
    highlights: {
      en: ['World-Class Faculty', 'Modern Facilities', 'Global Partnerships', 'Vibrant Campus Life'],
      zh: ['世界级师资', '现代化设施', '全球合作', '活力校园生活'],
    },
  },
  {
    slug: 'peking-university',
    name: 'Peking University',
    nameCn: '北京大学',
    city: 'Beijing',
    cityCn: '北京',
    ranking: 2,
    rating: 4.9,
    type: 'Public University',
    typeCn: '公立大学',
    established: 1898,
    students: '47,000+',
    intlStudents: '3,500+',
    description: 'Peking University is one of the most prestigious and oldest universities in China. Located in the Haidian District of Beijing, it is known for its outstanding programs in humanities, social sciences, and natural sciences. The campus features beautiful traditional Chinese architecture and is adjacent to the Summer Palace.',
    descriptionCn: '北京大学是中国最负盛名、历史最悠久的大学之一。位于北京海淀区，以人文社科和自然科学项目闻名。校园融合传统中式建筑，毗邻颐和园。',
    popularPrograms: ['Philosophy', 'International Relations', 'Law', 'Economics', 'Chinese Literature'],
    popularProgramsCn: ['哲学', '国际关系', '法学', '经济学', '中国文学'],
    tuitionUndergrad: '¥22,000 - 28,000/yr',
    tuitionGraduate: '¥24,000 - 38,000/yr',
    intake: 'September (Fall), March (Spring)',
    intakeCn: '9月（秋季），3月（春季）',
    disciplines: ['Humanities', 'Social Sciences', 'Law', 'Medicine'],
    image: 'https://images.unsplash.com/photo-1596437795667-1af9e4287c96?w=800&q=80',
    logo: '',
    qsRanking: '#14 QS World 2025',
    qsWorldRanking: 14,
    tags: ['985', '211', 'Double First Class'],
    tagsCn: ['985工程', '211工程', '双一流'],
    accommodation: 'Peking University provides well-furnished international student dormitories on campus, including Shaoyuan Dormitory with single and double rooms. All rooms come with air conditioning, private bathrooms, and internet access. Common areas include study rooms, laundry, and kitchens. The campus is located near many off-campus rental options.',
    accommodationCn: '北京大学为国际学生提供设施齐全的校内宿舍，包括勺园宾馆的单人间和双人间。所有房间配备空调、独立卫浴和网络。公共区域包括自习室、洗衣房和厨房。校园周边也有丰富的校外租房选择。',
    accommodationCost: '¥700 - 2,200/month',
    accommodationCostCn: '¥700 - 2,200/月',
    accommodationTypes: ['Single Room', 'Double Room', 'Suite'],
    accommodationTypesCn: ['单人间', '双人间', '套间'],
    applicationDeadline: '2026-07-15',
    gallery: [
      'https://images.unsplash.com/photo-1596437795667-1af9e4287c96?w=800&q=80',
      'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80',
      'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=800&q=80',
      'https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=800&q=80',
    ],
    highlights: {
      en: ['Leading Humanities Programs', 'Historic Campus', 'Strong Research Output', 'Diverse International Community'],
      zh: ['领先的人文项目', '历史悠久的校园', '强劲的科研产出', '多元的国际社区'],
    },
  },
  {
    slug: 'fudan-university',
    name: 'Fudan University',
    nameCn: '复旦大学',
    city: 'Shanghai',
    cityCn: '上海',
    ranking: 3,
    rating: 4.8,
    type: 'Public University',
    typeCn: '公立大学',
    established: 1905,
    students: '35,000+',
    intlStudents: '2,800+',
    description: 'Fudan University, located in Shanghai, is one of China\'s most prestigious and selective universities. It is a member of the C9 League and is renowned for its programs in humanities, social sciences, and natural sciences. The university\'s location in China\'s financial capital provides students with unparalleled opportunities for internships and career development.',
    descriptionCn: '复旦大学位于上海，是中国最负盛名和最具选择性的大学之一，C9联盟成员。以人文社科和自然科学项目著称，地处中国金融中心，为学生提供无与伦比的实习和职业发展机会。',
    popularPrograms: ['Economics', 'Journalism', 'Finance', 'Medicine', 'Political Science'],
    popularProgramsCn: ['经济学', '新闻学', '金融学', '医学', '政治学'],
    tuitionUndergrad: '¥21,000 - 28,000/yr',
    tuitionGraduate: '¥23,000 - 36,000/yr',
    intake: 'September (Fall)',
    intakeCn: '9月（秋季）',
    disciplines: ['Economics', 'Business', 'Medicine', 'Humanities'],
    image: 'https://images.unsplash.com/photo-1537531027583-9a0e3e52451f?w=800&q=80',
    logo: 'https://cdn.urongda.com//images/normal/medium/fudan-university-logo-1024px.png',
    qsRanking: '#39 QS World 2025',
    qsWorldRanking: 39,
    tags: ['985', '211', 'Double First Class'],
    tagsCn: ['985工程', '211工程', '双一流'],
    accommodation: 'Fudan University offers on-campus housing for international students at the International Student Dormitory (Lixiao Building). Rooms are equipped with air conditioning, private bathrooms, and internet. Shared kitchens and laundry facilities are available. Shanghai also offers many off-campus rental apartments near the campus.',
    accommodationCn: '复旦大学为国际学生提供校内住宿（留学生楼），房间配备空调、独立卫浴和网络。公共厨房和洗衣设施齐全。上海校园周边也有丰富的校外租房选择。',
    accommodationCost: '¥1,000 - 3,000/month',
    accommodationCostCn: '¥1,000 - 3,000/月',
    accommodationTypes: ['Single Room', 'Double Room', 'Off-campus Apartment'],
    accommodationTypesCn: ['单人间', '双人间', '校外公寓'],
    applicationDeadline: '2026-07-15',
    gallery: [
      'https://images.unsplash.com/photo-1537531027583-9a0e3e52451f?w=800&q=80',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
      'https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=800&q=80',
      'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
    ],
    highlights: {
      en: ['Shanghai Location Advantage', 'Strong Finance Programs', 'International Exchange', 'Research Excellence'],
      zh: ['上海地理优势', '强大的金融项目', '国际交流', '卓越研究'],
    },
  },
  {
    slug: 'shanghai-jiao-tong-university',
    name: 'Shanghai Jiao Tong University',
    nameCn: '上海交通大学',
    city: 'Shanghai',
    cityCn: '上海',
    ranking: 4,
    rating: 4.7,
    type: 'Public University',
    typeCn: '公立大学',
    established: 1896,
    students: '42,000+',
    intlStudents: '2,500+',
    description: 'Shanghai Jiao Tong University is a top-tier research university in Shanghai and a C9 League member. It excels in engineering, business, and medicine, and maintains strong ties with industry leaders. The university has multiple campuses across Shanghai with state-of-the-art facilities.',
    descriptionCn: '上海交通大学是上海顶尖研究型大学，C9联盟成员。在工程、商业和医学领域表现出色，与行业领袖保持紧密联系。在上海拥有多个校区，配备一流设施。',
    popularPrograms: ['Mechanical Engineering', 'Computer Science', 'MBA', 'Biomedical Engineering', 'Naval Architecture'],
    popularProgramsCn: ['机械工程', '计算机科学', 'MBA', '生物医学工程', '船舶与海洋工程'],
    tuitionUndergrad: '¥22,000 - 29,000/yr',
    tuitionGraduate: '¥24,000 - 38,000/yr',
    intake: 'September (Fall), March (Spring)',
    intakeCn: '9月（秋季），3月（春季）',
    disciplines: ['Engineering', 'Computer Science', 'Business', 'Medicine'],
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80',
    logo: '',
    qsRanking: '#45 QS World 2025',
    qsWorldRanking: 45,
    tags: ['985', '211', 'Double First Class'],
    tagsCn: ['985工程', '211工程', '双一流'],
    accommodation: 'Shanghai Jiao Tong University provides international student dormitories on both Minhang and Xuhui campuses. Rooms include air conditioning, private bathrooms, and Wi-Fi. The dormitories feature shared kitchens, study lounges, and laundry rooms. Minhang campus has a dedicated international student building with modern amenities.',
    accommodationCn: '上海交通大学在闵行和徐汇校区均设有国际学生宿舍。房间配备空调、独立卫浴和Wi-Fi。宿舍设有公共厨房、自习室和洗衣房。闵行校区有专门的国际学生楼，设施现代化。',
    accommodationCost: '¥900 - 2,800/month',
    accommodationCostCn: '¥900 - 2,800/月',
    accommodationTypes: ['Single Room', 'Double Room', 'International Student Dorm'],
    accommodationTypesCn: ['单人间', '双人间', '留学生公寓'],
    applicationDeadline: '2026-07-15',
    gallery: [
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
      'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
      'https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=800&q=80',
    ],
    highlights: {
      en: ['Industry Connections', 'Engineering Excellence', 'Medical School', 'Innovation Hub'],
      zh: ['行业联系', '工程卓越', '医学院', '创新中心'],
    },
  },
  {
    slug: 'zhejiang-university',
    name: 'Zhejiang University',
    nameCn: '浙江大学',
    city: 'Hangzhou',
    cityCn: '杭州',
    ranking: 5,
    rating: 4.7,
    type: 'Public University',
    typeCn: '公立大学',
    established: 1897,
    students: '55,000+',
    intlStudents: '3,000+',
    description: 'Zhejiang University, located in the scenic city of Hangzhou, is one of China\'s oldest and most prestigious universities. A C9 League member, it is known for its comprehensive academic offerings and strong emphasis on innovation and entrepreneurship. The campus is one of the most beautiful in China.',
    descriptionCn: '浙江大学位于风景秀丽的杭州，是中国历史最悠久、最负盛名的大学之一。C9联盟成员，以全面的学术项目和创新创业著称。校园被誉为中国最美之一。',
    popularPrograms: ['Computer Science', 'Agricultural Science', 'Optical Engineering', 'Clinical Medicine', 'Management'],
    popularProgramsCn: ['计算机科学', '农业科学', '光学工程', '临床医学', '管理学'],
    tuitionUndergrad: '¥20,000 - 27,000/yr',
    tuitionGraduate: '¥22,000 - 35,000/yr',
    intake: 'September (Fall)',
    intakeCn: '9月（秋季）',
    disciplines: ['Engineering', 'Computer Science', 'Medicine', 'Agriculture'],
    image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80',
    logo: '',
    qsRanking: '#47 QS World 2025',
    qsWorldRanking: 47,
    tags: ['985', '211', 'Double First Class'],
    tagsCn: ['985工程', '211工程', '双一流'],
    accommodation: 'Zhejiang University offers on-campus accommodation at the International Campus in Haining and Zijingang Campus in Hangzhou. International students enjoy furnished rooms with air conditioning, en-suite bathrooms, and high-speed internet. Common areas include kitchens, gyms, and study rooms. Hangzhou also has many affordable off-campus options.',
    accommodationCn: '浙江大学在海宁国际校区和杭州紫金港校区为国际学生提供校内住宿。房间配备空调、独立卫浴和高速网络。公共区域包括厨房、健身房和自习室。杭州也有许多价格实惠的校外住宿选择。',
    accommodationCost: '¥600 - 2,000/month',
    accommodationCostCn: '¥600 - 2,000/月',
    accommodationTypes: ['Single Room', 'Double Room', 'Shared Apartment'],
    accommodationTypesCn: ['单人间', '双人间', '合租公寓'],
    applicationDeadline: '2026-07-15',
    gallery: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
    ],
    highlights: {
      en: ['Innovation & Entrepreneurship', 'Beautiful Campus', 'Comprehensive Programs', 'Strong Industry Ties'],
      zh: ['创新创业', '美丽校园', '综合项目', '紧密行业联系'],
    },
  },
  {
    slug: 'nanjing-university',
    name: 'Nanjing University',
    nameCn: '南京大学',
    city: 'Nanjing',
    cityCn: '南京',
    ranking: 6,
    rating: 4.6,
    type: 'Public University',
    typeCn: '公立大学',
    established: 1902,
    students: '33,000+',
    intlStudents: '1,800+',
    description: 'Nanjing University is a prestigious C9 League member known for its academic rigor and research excellence. Located in the historic city of Nanjing, it offers strong programs in sciences, humanities, and social sciences. The university has a long tradition of scholarly excellence dating back over a century.',
    descriptionCn: '南京大学是C9联盟成员，以学术严谨和研究卓越著称。位于历史文化名城南京，在理科、人文社科领域拥有强势项目。学术传承逾百年。',
    popularPrograms: ['Physics', 'Chemistry', 'Astronomy', 'Chinese Language', 'Geosciences'],
    popularProgramsCn: ['物理学', '化学', '天文学', '汉语言文学', '地球科学'],
    tuitionUndergrad: '¥20,000 - 26,000/yr',
    tuitionGraduate: '¥22,000 - 34,000/yr',
    intake: 'September (Fall)',
    intakeCn: '9月（秋季）',
    disciplines: ['Sciences', 'Humanities', 'Social Sciences', 'Geosciences'],
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80',
    logo: '',
    qsRanking: '#141 QS World 2025',
    qsWorldRanking: 141,
    tags: ['985', '211', 'Double First Class'],
    tagsCn: ['985工程', '211工程', '双一流'],
    accommodation: 'Nanjing University provides on-campus dormitories for international students at Xianlin Campus. Rooms come with air conditioning, private bathrooms, and internet access. Shared kitchens and laundry facilities are available. Nanjing offers a lower cost of living compared to Beijing and Shanghai, with many affordable off-campus rentals nearby.',
    accommodationCn: '南京大学在仙林校区为国际学生提供校内宿舍。房间配备空调、独立卫浴和网络。公共厨房和洗衣设施齐全。与北京和上海相比，南京生活成本较低，校园周边有大量实惠的校外租房。',
    accommodationCost: '¥500 - 1,800/month',
    accommodationCostCn: '¥500 - 1,800/月',
    accommodationTypes: ['Single Room', 'Double Room', 'Shared Apartment'],
    accommodationTypesCn: ['单人间', '双人间', '合租公寓'],
    applicationDeadline: '2026-07-15',
    gallery: [
      'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&q=80',
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
    ],
    highlights: {
      en: ['Academic Rigor', 'Research Excellence', 'Historic City', 'Strong Sciences'],
      zh: ['学术严谨', '研究卓越', '历史名城', '强大的理科'],
    },
  },
  {
    slug: 'wuhan-university',
    name: 'Wuhan University',
    nameCn: '武汉大学',
    city: 'Wuhan',
    cityCn: '武汉',
    ranking: 7,
    rating: 4.6,
    type: 'Public University',
    typeCn: '公立大学',
    established: 1893,
    students: '58,000+',
    intlStudents: '2,200+',
    description: 'Wuhan University is renowned for its beautiful cherry blossom campus and strong academic reputation. As a comprehensive university, it excels in multiple disciplines including remote sensing, law, and water conservancy. The university is located on Luojia Hill with stunning views of East Lake.',
    descriptionCn: '武汉大学以美丽的樱花校园和卓越的学术声誉著称。作为综合性大学，在遥感、法学、水利等多个学科领域表现出色。校园坐落于珞珈山上，东湖美景尽收眼底。',
    popularPrograms: ['Remote Sensing', 'Law', 'Water Conservancy', 'Journalism', 'Biology'],
    popularProgramsCn: ['遥感科学', '法学', '水利工程', '新闻学', '生物学'],
    tuitionUndergrad: '¥18,000 - 25,000/yr',
    tuitionGraduate: '¥20,000 - 32,000/yr',
    intake: 'September (Fall), March (Spring)',
    intakeCn: '9月（秋季），3月（春季）',
    disciplines: ['Law', 'Engineering', 'Sciences', 'Medicine'],
    image: 'https://images.unsplash.com/photo-1548786811-dd6e453ccca7?w=800&q=80',
    logo: '',
    qsRanking: '#194 QS World 2025',
    qsWorldRanking: 194,
    tags: ['985', '211', 'Double First Class'],
    tagsCn: ['985工程', '211工程', '双一流'],
    accommodation: 'Wuhan University offers on-campus accommodation for international students at the International Education College dormitory. Rooms feature air conditioning, private bathrooms, and internet. The campus has shared kitchens, laundry rooms, and recreational areas. Wuhan is one of the most affordable major cities in China for student housing.',
    accommodationCn: '武汉大学在国际教育学院宿舍为国际学生提供校内住宿。房间配备空调、独立卫浴和网络。校园设有公共厨房、洗衣房和休闲区域。武汉是中国学生住房最经济实惠的大城市之一。',
    accommodationCost: '¥400 - 1,500/month',
    accommodationCostCn: '¥400 - 1,500/月',
    accommodationTypes: ['Single Room', 'Double Room', 'International Student Dorm'],
    accommodationTypesCn: ['单人间', '双人间', '留学生公寓'],
    applicationDeadline: '2026-07-15',
    gallery: [
      'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80',
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80',
      'https://images.unsplash.com/photo-1470219556762-1fd5b23f975d?w=800&q=80',
    ],
    highlights: {
      en: ['Cherry Blossom Campus', 'Remote Sensing Leader', 'Comprehensive Programs', 'Central China Hub'],
      zh: ['樱花校园', '遥感学科领先', '综合项目', '华中地区中心'],
    },
  },
  {
    slug: 'sun-yat-sen-university',
    name: 'Sun Yat-sen University',
    nameCn: '中山大学',
    city: 'Guangzhou',
    cityCn: '广州',
    ranking: 8,
    rating: 4.5,
    type: 'Public University',
    typeCn: '公立大学',
    established: 1924,
    students: '52,000+',
    intlStudents: '2,000+',
    description: 'Sun Yat-sen University, located in Guangzhou, is one of the leading universities in South China. Named after the founding father of modern China, it offers excellent programs in business, medicine, and social sciences. Its location in the Pearl River Delta provides unique opportunities in China\'s manufacturing and trade hub.',
    descriptionCn: '中山大学位于广州，是华南地区顶尖大学之一。以中国近代国父命名，在商科、医学和社会科学领域拥有优秀项目。地处珠三角，在中国制造和贸易中心提供独特机遇。',
    popularPrograms: ['Business Administration', 'Clinical Medicine', 'Philosophy', 'Sociology', 'Marine Science'],
    popularProgramsCn: ['工商管理', '临床医学', '哲学', '社会学', '海洋科学'],
    tuitionUndergrad: '¥19,000 - 26,000/yr',
    tuitionGraduate: '¥21,000 - 34,000/yr',
    intake: 'September (Fall)',
    intakeCn: '9月（秋季）',
    disciplines: ['Business', 'Medicine', 'Social Sciences', 'Marine Science'],
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80',
    logo: '',
    qsRanking: '#331 QS World 2025',
    qsWorldRanking: 331,
    tags: ['985', '211', 'Double First Class'],
    tagsCn: ['985工程', '211工程', '双一流'],
    accommodation: 'Sun Yat-sen University provides on-campus housing for international students at South Campus and Higher Education Mega Center. Rooms include air conditioning, private bathrooms, and internet access. Shared kitchens and laundry are available. Guangzhou offers a vibrant rental market with many affordable options near the university.',
    accommodationCn: '中山大学在南校区和大学城校区为国际学生提供校内住宿。房间配备空调、独立卫浴和网络。公共厨房和洗衣设施齐全。广州租房市场活跃，校园周边有许多实惠的住宿选择。',
    accommodationCost: '¥600 - 2,200/month',
    accommodationCostCn: '¥600 - 2,200/月',
    accommodationTypes: ['Single Room', 'Double Room', 'Off-campus Apartment'],
    accommodationTypesCn: ['单人间', '双人间', '校外公寓'],
    applicationDeadline: '2026-07-15',
    gallery: [
      'https://images.unsplash.com/photo-1577985043696-8bd54d9c4f19?w=800&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
    ],
    highlights: {
      en: ['South China Gateway', 'Business Hub', 'Medical Excellence', 'Tropical Research'],
      zh: ['华南门户', '商业中心', '医学卓越', '热带研究'],
    },
  },
];

export interface Program {
  slug: string;
  name: string;
  nameCn: string;
  universitySlug: string;
  degree: 'Bachelor' | 'Master' | 'PhD';
  discipline: string;
  disciplineCn: string;
  language: 'English' | 'Chinese' | 'Bilingual';
  duration: string;
  durationCn: string;
  tuition: string;
  description: string;
  descriptionCn: string;
  requirements: string[];
  requirementsCn: string[];
  curriculum: string[];
  curriculumCn: string[];
  scholarshipAvailable: boolean;
  intake: string;
  intakeCn: string;
}

export const programs: Program[] = [
  {
    slug: 'computer-science-bsc-tsinghua',
    name: 'BSc in Computer Science',
    nameCn: '计算机科学学士',
    universitySlug: 'tsinghua-university',
    degree: 'Bachelor',
    discipline: 'Computer Science',
    disciplineCn: '计算机科学',
    language: 'English',
    duration: '4 years',
    durationCn: '4年',
    tuition: '¥30,000/year',
    description: 'A rigorous program covering algorithms, artificial intelligence, software engineering, and data science. Students gain hands-on experience through research labs and industry partnerships with leading tech companies in Beijing\'s Zhongguancun district.',
    descriptionCn: '涵盖算法、人工智能、软件工程和数据科学的严谨项目。学生通过研究实验室和与北京中关村领先科技公司的行业合作获得实践经验。',
    requirements: ['High school diploma with strong math background', 'Minimum IELTS 6.5 or TOEFL 85', 'Personal statement', 'Two recommendation letters', 'Entrance exam in mathematics'],
    requirementsCn: ['具有强数学背景的高中文凭', '雅思最低6.5或托福85', '个人陈述', '两封推荐信', '数学入学考试'],
    curriculum: ['Data Structures & Algorithms', 'Computer Architecture', 'Operating Systems', 'Machine Learning', 'Database Systems', 'Software Engineering', 'Artificial Intelligence', 'Capstone Project'],
    curriculumCn: ['数据结构与算法', '计算机体系结构', '操作系统', '机器学习', '数据库系统', '软件工程', '人工智能', '毕业设计'],
    scholarshipAvailable: true,
    intake: 'September',
    intakeCn: '9月',
  },
  {
    slug: 'electronic-engineering-msc-tsinghua',
    name: 'MSc in Electronic Engineering',
    nameCn: '电子工程硕士',
    universitySlug: 'tsinghua-university',
    degree: 'Master',
    discipline: 'Engineering',
    disciplineCn: '工程学',
    language: 'English',
    duration: '2-3 years',
    durationCn: '2-3年',
    tuition: '¥40,000/year',
    description: 'An advanced program focusing on integrated circuits, signal processing, and communications engineering. Access to state-of-the-art microelectronics labs and collaboration with China\'s top semiconductor companies.',
    descriptionCn: '专注于集成电路、信号处理和通信工程的高级项目。可使用最先进的微电子实验室，与中国顶级半导体公司合作。',
    requirements: ['Bachelor\'s degree in EE or related field', 'Minimum IELTS 6.5 or TOEFL 90', 'Research proposal', 'Two recommendation letters from professors', 'GPA 3.0+'],
    requirementsCn: ['电子工程或相关领域学士学位', '雅思最低6.5或托福90', '研究计划', '两封教授推荐信', 'GPA 3.0以上'],
    curriculum: ['Advanced Signal Processing', 'VLSI Design', 'Embedded Systems', 'Wireless Communications', 'Semiconductor Physics', 'Thesis Research'],
    curriculumCn: ['高级信号处理', '超大规模集成电路设计', '嵌入式系统', '无线通信', '半导体物理', '论文研究'],
    scholarshipAvailable: true,
    intake: 'September',
    intakeCn: '9月',
  },
  {
    slug: 'international-relations-ma-peking',
    name: 'MA in International Relations',
    nameCn: '国际关系硕士',
    universitySlug: 'peking-university',
    degree: 'Master',
    discipline: 'Social Sciences',
    disciplineCn: '社会科学',
    language: 'English',
    duration: '2 years',
    durationCn: '2年',
    tuition: '¥30,000/year',
    description: 'A comprehensive program exploring global politics, diplomacy, and China\'s role in international affairs. Students benefit from PKU\'s proximity to government institutions and think tanks in Beijing.',
    descriptionCn: '探索全球政治、外交和中国在国际事务中作用的综合项目。学生受益于北大毗邻北京政府机构和智库的地理优势。',
    requirements: ['Bachelor\'s degree in any discipline', 'Minimum IELTS 7.0 or TOEFL 100', 'Writing sample (academic paper)', 'Two recommendation letters', 'Statement of purpose'],
    requirementsCn: ['任何学科的本科学位', '雅思最低7.0或托福100', '写作样本（学术论文）', '两封推荐信', '目的陈述'],
    curriculum: ['International Political Economy', 'Chinese Foreign Policy', 'Global Governance', 'Diplomatic History', 'Research Methods', 'Thesis'],
    curriculumCn: ['国际政治经济学', '中国外交政策', '全球治理', '外交史', '研究方法', '论文'],
    scholarshipAvailable: true,
    intake: 'September',
    intakeCn: '9月',
  },
  {
    slug: 'chinese-language-culture-bsc-peking',
    name: 'BA in Chinese Language & Culture',
    nameCn: '汉语言文化学士',
    universitySlug: 'peking-university',
    degree: 'Bachelor',
    discipline: 'Humanities',
    disciplineCn: '人文',
    language: 'Chinese',
    duration: '4 years',
    durationCn: '4年',
    tuition: '¥24,000/year',
    description: 'An immersive program for international students to master Chinese language and deeply understand Chinese culture, literature, and history. Includes intensive language training and cultural field trips.',
    descriptionCn: '为国际学生提供沉浸式中文学习项目，深入理解中国文化、文学和历史。包含强化语言训练和文化实地考察。',
    requirements: ['High school diploma', 'HSK Level 4 or above', 'Personal statement in Chinese', 'Two recommendation letters', 'Interview'],
    requirementsCn: ['高中文凭', 'HSK四级及以上', '中文个人陈述', '两封推荐信', '面试'],
    curriculum: ['Advanced Chinese Reading', 'Classical Chinese', 'Chinese Literature', 'Chinese Philosophy', 'Cultural Heritage of China', 'Translation Practice', 'Graduation Thesis'],
    curriculumCn: ['高级中文阅读', '古代汉语', '中国文学', '中国哲学', '中国文化遗产', '翻译实践', '毕业论文'],
    scholarshipAvailable: true,
    intake: 'September',
    intakeCn: '9月',
  },
  {
    slug: 'finance-msc-fudan',
    name: 'MSc in Finance',
    nameCn: '金融学硕士',
    universitySlug: 'fudan-university',
    degree: 'Master',
    discipline: 'Business',
    disciplineCn: '商业',
    language: 'English',
    duration: '2 years',
    durationCn: '2年',
    tuition: '¥36,000/year',
    description: 'A top-tier finance program in Shanghai\'s financial district, offering cutting-edge coursework in quantitative finance, fintech, and investment management. Strong connections with Wall Street firms and Chinese financial institutions.',
    descriptionCn: '上海金融中心的顶级金融项目，提供量化金融、金融科技和投资管理的前沿课程。与华尔街公司和中国金融机构有紧密联系。',
    requirements: ['Bachelor\'s degree in finance, economics, or related field', 'Minimum IELTS 6.5 or TOEFL 90', 'GMAT/GRE scores', 'Two recommendation letters', 'Professional resume'],
    requirementsCn: ['金融、经济或相关领域学士学位', '雅思最低6.5或托福90', 'GMAT/GRE成绩', '两封推荐信', '职业简历'],
    curriculum: ['Quantitative Finance', 'Financial Derivatives', 'Risk Management', 'Fintech & Blockchain', 'Corporate Finance', 'Investment Analysis', 'Thesis'],
    curriculumCn: ['量化金融', '金融衍生品', '风险管理', '金融科技与区块链', '公司金融', '投资分析', '论文'],
    scholarshipAvailable: true,
    intake: 'September',
    intakeCn: '9月',
  },
  {
    slug: 'clinical-medicine-mbbs-fudan',
    name: 'MBBS in Clinical Medicine',
    nameCn: '临床医学学士(MBBS)',
    universitySlug: 'fudan-university',
    degree: 'Bachelor',
    discipline: 'Medicine',
    disciplineCn: '医学',
    language: 'English',
    duration: '6 years',
    durationCn: '6年',
    tuition: '¥42,000/year',
    description: 'A comprehensive medical program taught in English, designed for international students. Includes pre-clinical studies, clinical rotations at top Shanghai hospitals, and research opportunities in medical sciences.',
    descriptionCn: '全英文授课的综合医学项目，专为国际学生设计。包括临床前学习、上海顶级医院临床轮转和医学科研机会。',
    requirements: ['High school diploma with strong science background', 'Minimum IELTS 6.5 or TOEFL 90', 'Biology and Chemistry prerequisites', 'Health examination certificate', 'Interview'],
    requirementsCn: ['具有强理科背景的高中文凭', '雅思最低6.5或托福90', '生物和化学先修课', '健康检查证明', '面试'],
    curriculum: ['Anatomy', 'Physiology', 'Pathology', 'Pharmacology', 'Internal Medicine', 'Surgery', 'Pediatrics', 'Clinical Rotations'],
    curriculumCn: ['解剖学', '生理学', '病理学', '药理学', '内科学', '外科学', '儿科学', '临床轮转'],
    scholarshipAvailable: true,
    intake: 'September',
    intakeCn: '9月',
  },
  {
    slug: 'mba-shanghai-jiao-tong',
    name: 'MBA (International)',
    nameCn: '国际MBA',
    universitySlug: 'shanghai-jiao-tong-university',
    degree: 'Master',
    discipline: 'Business',
    disciplineCn: '商业',
    language: 'English',
    duration: '2 years',
    durationCn: '2年',
    tuition: '¥58,000/year',
    description: 'A globally ranked MBA program with a China focus. Combines Western management theory with Chinese business practices, featuring industry mentorship, company visits, and a diverse cohort of international professionals.',
    descriptionCn: '全球排名领先的MBA项目，以中国为焦点。融合西方管理理论与中国商业实践，提供行业导师、企业参观和多元国际专业学员群体。',
    requirements: ['Bachelor\'s degree', 'Minimum 3 years work experience', 'Minimum IELTS 6.5 or TOEFL 90', 'GMAT/GRE scores', 'Two recommendation letters', 'Interview'],
    requirementsCn: ['学士学位', '至少3年工作经验', '雅思最低6.5或托福90', 'GMAT/GRE成绩', '两封推荐信', '面试'],
    curriculum: ['Strategic Management', 'China Business Environment', 'Financial Accounting', 'Marketing Strategy', 'Supply Chain Management', 'Leadership & Ethics', 'Capstone Project'],
    curriculumCn: ['战略管理', '中国商业环境', '财务会计', '营销战略', '供应链管理', '领导力与伦理', '毕业项目'],
    scholarshipAvailable: false,
    intake: 'September',
    intakeCn: '9月',
  },
  {
    slug: 'biomedical-engineering-phd-sjtu',
    name: 'PhD in Biomedical Engineering',
    nameCn: '生物医学工程博士',
    universitySlug: 'shanghai-jiao-tong-university',
    degree: 'PhD',
    discipline: 'Engineering',
    disciplineCn: '工程学',
    language: 'English',
    duration: '3-4 years',
    durationCn: '3-4年',
    tuition: '¥35,000/year',
    description: 'A research-intensive doctoral program at the intersection of engineering and medicine. Access to SJTU\'s world-class medical engineering labs and affiliated hospitals for translational research.',
    descriptionCn: '工程与医学交叉的研究型博士项目。可使用交大世界一流的医学工程实验室和附属医院进行转化研究。',
    requirements: ['Master\'s degree in BME or related field', 'Minimum IELTS 6.5 or TOEFL 90', 'Detailed research proposal', 'Three recommendation letters', 'Published research papers preferred'],
    requirementsCn: ['生物医学工程或相关领域硕士学位', '雅思最低6.5或托福90', '详细研究计划', '三封推荐信', '有发表研究论文者优先'],
    curriculum: ['Advanced Biomaterials', 'Medical Imaging', 'Tissue Engineering', 'Neural Engineering', 'Dissertation Research', 'Teaching Practicum'],
    curriculumCn: ['高级生物材料', '医学影像', '组织工程', '神经工程', '论文研究', '教学实践'],
    scholarshipAvailable: true,
    intake: 'September',
    intakeCn: '9月',
  },
  {
    slug: 'artificial-intelligence-msc-zju',
    name: 'MSc in Artificial Intelligence',
    nameCn: '人工智能硕士',
    universitySlug: 'zhejiang-university',
    degree: 'Master',
    discipline: 'Computer Science',
    disciplineCn: '计算机科学',
    language: 'English',
    duration: '2.5 years',
    durationCn: '2.5年',
    tuition: '¥35,000/year',
    description: 'A cutting-edge program in one of China\'s top AI research centers. Covers deep learning, natural language processing, computer vision, and robotics with extensive lab work and industry collaboration.',
    descriptionCn: '中国顶级AI研究中心之一的前沿项目。涵盖深度学习、自然语言处理、计算机视觉和机器人技术，配有丰富的实验室工作和行业合作。',
    requirements: ['Bachelor\'s degree in CS, math, or related field', 'Minimum IELTS 6.5 or TOEFL 90', 'Programming proficiency in Python/C++', 'Research proposal', 'Two recommendation letters'],
    requirementsCn: ['计算机科学、数学或相关领域学士学位', '雅思最低6.5或托福90', 'Python/C++编程能力', '研究计划', '两封推荐信'],
    curriculum: ['Deep Learning', 'Computer Vision', 'Natural Language Processing', 'Reinforcement Learning', 'AI Ethics & Governance', 'Research Project', 'Thesis'],
    curriculumCn: ['深度学习', '计算机视觉', '自然语言处理', '强化学习', 'AI伦理与治理', '研究项目', '论文'],
    scholarshipAvailable: true,
    intake: 'September',
    intakeCn: '9月',
  },
  {
    slug: 'agricultural-science-bsc-zju',
    name: 'BSc in Agricultural Science',
    nameCn: '农业科学学士',
    universitySlug: 'zhejiang-university',
    degree: 'Bachelor',
    discipline: 'Sciences',
    disciplineCn: '理科',
    language: 'Bilingual',
    duration: '4 years',
    durationCn: '4年',
    tuition: '¥22,000/year',
    description: 'A unique program combining modern agricultural technology with sustainability. ZJU\'s agricultural science ranks among the world\'s best, with access to experimental farms and biotech labs in Hangzhou.',
    descriptionCn: '结合现代农业技术与可持续性的独特项目。浙大农业科学排名世界前列，可使用杭州的实验农场和生物技术实验室。',
    requirements: ['High school diploma with science background', 'Minimum IELTS 6.0 or TOEFL 75', 'HSK Level 4 (for Chinese-taught modules)', 'Personal statement', 'Two recommendation letters'],
    requirementsCn: ['具有理科背景的高中文凭', '雅思最低6.0或托福75', 'HSK四级（中文授课模块）', '个人陈述', '两封推荐信'],
    curriculum: ['Plant Biology', 'Soil Science', 'Agricultural Biotechnology', 'Food Safety & Quality', 'Sustainable Agriculture', 'Smart Farming Technology', 'Field Practice'],
    curriculumCn: ['植物生物学', '土壤学', '农业生物技术', '食品安全与质量', '可持续农业', '智慧农业技术', '田间实践'],
    scholarshipAvailable: true,
    intake: 'September',
    intakeCn: '9月',
  },
  {
    slug: 'physics-phd-nanjing',
    name: 'PhD in Physics',
    nameCn: '物理学博士',
    universitySlug: 'nanjing-university',
    degree: 'PhD',
    discipline: 'Sciences',
    disciplineCn: '理科',
    language: 'English',
    duration: '3-5 years',
    durationCn: '3-5年',
    tuition: '¥30,000/year',
    description: 'A doctoral program at one of China\'s strongest physics departments. Research areas include condensed matter physics, quantum information, and nanoscience with access to national key laboratories.',
    descriptionCn: '中国最强物理系之一的博士项目。研究方向包括凝聚态物理、量子信息和纳米科学，可使用国家重点实验室。',
    requirements: ['Master\'s degree in physics or related field', 'Minimum IELTS 6.5 or TOEFL 90', 'Detailed research proposal', 'Three recommendation letters', 'Published research papers'],
    requirementsCn: ['物理学或相关领域硕士学位', '雅思最低6.5或托福90', '详细研究计划', '三封推荐信', '已发表研究论文'],
    curriculum: ['Advanced Quantum Mechanics', 'Statistical Physics', 'Solid State Physics', 'Quantum Information', 'Research Seminars', 'Dissertation'],
    curriculumCn: ['高等量子力学', '统计物理', '固体物理', '量子信息', '研究研讨', '博士论文'],
    scholarshipAvailable: true,
    intake: 'September',
    intakeCn: '9月',
  },
  {
    slug: 'law-llm-wuhan',
    name: 'LLM in International Law',
    nameCn: '国际法法学硕士',
    universitySlug: 'wuhan-university',
    degree: 'Master',
    discipline: 'Law',
    disciplineCn: '法学',
    language: 'English',
    duration: '2 years',
    durationCn: '2年',
    tuition: '¥28,000/year',
    description: 'A specialized program in international law with emphasis on Chinese law, international trade law, and human rights law. WHU\'s law school is one of China\'s most prestigious, with strong alumni networks in legal practice.',
    descriptionCn: '国际法专业项目，侧重中国法、国际贸易法和人权法。武大法学院是中国最负盛名的法学院之一，在法律实务界拥有强大的校友网络。',
    requirements: ['Bachelor\'s degree in Law', 'Minimum IELTS 7.0 or TOEFL 100', 'Legal writing sample', 'Two recommendation letters', 'Statement of purpose'],
    requirementsCn: ['法学学士学位', '雅思最低7.0或托福100', '法律写作样本', '两封推荐信', '目的陈述'],
    curriculum: ['International Trade Law', 'Chinese Legal System', 'International Arbitration', 'Human Rights Law', 'Comparative Law', 'Legal Research & Writing', 'Thesis'],
    curriculumCn: ['国际贸易法', '中国法律制度', '国际仲裁', '人权法', '比较法', '法律研究与写作', '论文'],
    scholarshipAvailable: true,
    intake: 'September',
    intakeCn: '9月',
  },
  {
    slug: 'marine-science-msc-sysu',
    name: 'MSc in Marine Science',
    nameCn: '海洋科学硕士',
    universitySlug: 'sun-yat-sen-university',
    degree: 'Master',
    discipline: 'Sciences',
    disciplineCn: '理科',
    language: 'Bilingual',
    duration: '3 years',
    durationCn: '3年',
    tuition: '¥26,000/year',
    description: 'A research-focused program leveraging SYSU\'s unique location near the South China Sea. Covers marine biology, oceanography, and coastal management with field research opportunities.',
    descriptionCn: '利用中山大学毗邻南海的独特地理位置的研究型项目。涵盖海洋生物学、海洋学和海岸管理，提供实地研究机会。',
    requirements: ['Bachelor\'s degree in marine science, biology, or related field', 'Minimum IELTS 6.0 or TOEFL 80', 'HSK Level 4 (for Chinese-taught modules)', 'Research proposal', 'Two recommendation letters'],
    requirementsCn: ['海洋科学、生物或相关领域学士学位', '雅思最低6.0或托福80', 'HSK四级（中文授课模块）', '研究计划', '两封推荐信'],
    curriculum: ['Marine Biology', 'Physical Oceanography', 'Coastal Zone Management', 'Marine Ecology', 'Research Methods', 'Field Research', 'Thesis'],
    curriculumCn: ['海洋生物学', '物理海洋学', '海岸带管理', '海洋生态学', '研究方法', '野外研究', '论文'],
    scholarshipAvailable: true,
    intake: 'September',
    intakeCn: '9月',
  },
  {
    slug: 'business-administration-bba-sysu',
    name: 'BBA in Business Administration',
    nameCn: '工商管理学士',
    universitySlug: 'sun-yat-sen-university',
    degree: 'Bachelor',
    discipline: 'Business',
    disciplineCn: '商业',
    language: 'English',
    duration: '4 years',
    durationCn: '4年',
    tuition: '¥26,000/year',
    description: 'A comprehensive business program in Guangzhou, China\'s southern trade hub. Combines management theory with practical business skills, featuring internships at Fortune 500 companies in the Greater Bay Area.',
    descriptionCn: '位于中国南方贸易中心广州的综合商科项目。结合管理理论与实用商业技能，提供大湾区财富500强企业实习机会。',
    requirements: ['High school diploma', 'Minimum IELTS 6.0 or TOEFL 75', 'Math proficiency', 'Personal statement', 'Two recommendation letters'],
    requirementsCn: ['高中文凭', '雅思最低6.0或托福75', '数学能力', '个人陈述', '两封推荐信'],
    curriculum: ['Principles of Management', 'Financial Accounting', 'Marketing', 'Business Statistics', 'Organizational Behavior', 'Strategic Management', 'Internship', 'Capstone'],
    curriculumCn: ['管理学原理', '财务会计', '市场营销', '商业统计', '组织行为学', '战略管理', '实习', '毕业项目'],
    scholarshipAvailable: false,
    intake: 'September',
    intakeCn: '9月',
  },
  {
    slug: 'architecture-bsc-tsinghua',
    name: 'BSc in Architecture',
    nameCn: '建筑学学士',
    universitySlug: 'tsinghua-university',
    degree: 'Bachelor',
    discipline: 'Engineering',
    disciplineCn: '工程学',
    language: 'Chinese',
    duration: '5 years',
    durationCn: '5年',
    tuition: '¥30,000/year',
    description: 'China\'s top-ranked architecture program, blending traditional Chinese architectural philosophy with modern design thinking. Students work in design studios and participate in international architecture competitions.',
    descriptionCn: '中国排名第一的建筑学项目，融合传统中国建筑哲学与现代设计思维。学生在设计工作室工作，参与国际建筑设计竞赛。',
    requirements: ['High school diploma with art portfolio', 'HSK Level 5 or above', 'Drawing aptitude test', 'Personal statement', 'Two recommendation letters'],
    requirementsCn: ['具有艺术作品集的高中文凭', 'HSK五级及以上', '绘画能力测试', '个人陈述', '两封推荐信'],
    curriculum: ['Architectural Design Studio', 'History of Chinese Architecture', 'Structural Mechanics', 'Urban Planning', 'Building Technology', 'Landscape Architecture', 'Design Thesis'],
    curriculumCn: ['建筑设计工作室', '中国建筑史', '结构力学', '城市规划', '建筑技术', '景观建筑', '设计毕业论文'],
    scholarshipAvailable: true,
    intake: 'September',
    intakeCn: '9月',
  },
  {
    slug: 'economics-phd-fudan',
    name: 'PhD in Economics',
    nameCn: '经济学博士',
    universitySlug: 'fudan-university',
    degree: 'PhD',
    discipline: 'Social Sciences',
    disciplineCn: '社会科学',
    language: 'English',
    duration: '4-5 years',
    durationCn: '4-5年',
    tuition: '¥32,000/year',
    description: 'A doctoral program in one of China\'s leading economics departments. Research strengths in Chinese economy, development economics, and financial economics. Access to Shanghai\'s financial data and policy research institutions.',
    descriptionCn: '中国领先经济系之一的博士项目。在中国经济、发展经济学和金融经济学方面研究实力雄厚。可使用上海金融数据和政策研究机构资源。',
    requirements: ['Master\'s degree in economics or related field', 'Minimum IELTS 7.0 or TOEFL 100', 'Research proposal', 'Three recommendation letters', 'Published research papers preferred'],
    requirementsCn: ['经济学或相关领域硕士学位', '雅思最低7.0或托福100', '研究计划', '三封推荐信', '有发表研究论文者优先'],
    curriculum: ['Advanced Microeconomics', 'Advanced Macroeconomics', 'Econometrics', 'Chinese Economy Seminar', 'Development Economics', 'Dissertation Research'],
    curriculumCn: ['高级微观经济学', '高级宏观经济学', '计量经济学', '中国经济研讨', '发展经济学', '论文研究'],
    scholarshipAvailable: true,
    intake: 'September',
    intakeCn: '9月',
  },
];

export const degreeTypes = ['Bachelor', 'Master', 'PhD'];
export const degreeTypesCn = ['学士', '硕士', '博士'];

export const languages = ['English', 'Chinese', 'Bilingual'];
export const languagesCn = ['英语', '中文', '双语'];

export const programDisciplines = ['Engineering', 'Computer Science', 'Business', 'Medicine', 'Humanities', 'Social Sciences', 'Law', 'Sciences'];
export const programDisciplinesCn = ['工程学', '计算机科学', '商业', '医学', '人文', '社会科学', '法学', '理科'];

export const cities = ['Beijing', 'Shanghai', 'Hangzhou', 'Nanjing', 'Wuhan', 'Guangzhou'];
export const citiesCn = ['北京', '上海', '杭州', '南京', '武汉', '广州'];

export const disciplines = [
  'Engineering',
  'Computer Science',
  'Business',
  'Medicine',
  'Humanities',
  'Social Sciences',
  'Law',
  'Sciences',
];
export const disciplinesCn = [
  '工程学',
  '计算机科学',
  '商业',
  '医学',
  '人文',
  '社会科学',
  '法学',
  '理科',
];

export interface Scholarship {
  slug: string;
  name: string;
  nameCn: string;
  type: 'Full' | 'Partial';
  typeCn: string;
  coverage: string[];
  coverageCn: string[];
  degreeLevels: string[];
  degreeLevelsCn: string[];
  eligibleRegions: string;
  eligibleRegionsCn: string;
  duration: string;
  durationCn: string;
  deadline: string;
  deadlineCn: string;
  description: string;
  descriptionCn: string;
  requirements: string[];
  requirementsCn: string[];
  applicationMethod: string;
  applicationMethodCn: string;
  benefits: string[];
  benefitsCn: string[];
  officialLink: string;
}

export const scholarships: Scholarship[] = [
  {
    slug: 'csc-bilateral-program',
    name: 'Chinese Government Scholarship — Bilateral Program',
    nameCn: '中国政府奖学金——双边项目',
    type: 'Full',
    typeCn: '全额',
    coverage: ['Tuition', 'Accommodation', 'Stipend', 'Medical Insurance'],
    coverageCn: ['学费', '住宿', '生活费', '医疗保险'],
    degreeLevels: ['Bachelor', 'Master', 'PhD', 'General Scholar', 'Senior Scholar'],
    degreeLevelsCn: ['学士', '硕士', '博士', '普通进修生', '高级进修生'],
    eligibleRegions: 'All countries with diplomatic relations with China',
    eligibleRegionsCn: '所有与中国有外交关系的国家',
    duration: '4-5 years (Bachelor), 2-3 years (Master), 3-4 years (PhD)',
    durationCn: '4-5年（学士），2-3年（硕士），3-4年（博士）',
    deadline: 'January — April (varies by country)',
    deadlineCn: '1月至4月（因国家而异）',
    description: 'The Chinese Government Scholarship Bilateral Program is the most prestigious and comprehensive scholarship for international students. It is established by the Ministry of Education of China to support outstanding international students pursuing degrees at Chinese universities. The program covers all major expenses and provides a generous monthly stipend.',
    descriptionCn: '中国政府奖学金双边项目是面向国际学生最权威、最全面的奖学金。由中国教育部设立，旨在支持优秀国际学生在中国大学攻读学位。该项目覆盖所有主要费用并提供丰厚的月度生活费。',
    requirements: [
      'Be a citizen of a country other than China and in good health',
      'For Bachelor programs: high school graduate under age 25',
      'For Master programs: Bachelor degree holder under age 35',
      'For PhD programs: Master degree holder under age 40',
      'Meet the language requirements of the program (HSK or IELTS/TOEFL)',
      'Not receiving any other Chinese government scholarship',
    ],
    requirementsCn: [
      '非中国籍公民，身体健康',
      '学士学位项目：高中毕业，25岁以下',
      '硕士学位项目：持有学士学位，35岁以下',
      '博士学位项目：持有硕士学位，40岁以下',
      '满足项目的语言要求（HSK或IELTS/TOEFL）',
      '未获得其他中国政府奖学金',
    ],
    applicationMethod: 'Apply through the Chinese embassy/consulate in your home country or directly to the target university via the CSC online application system.',
    applicationMethodCn: '通过驻在国中国使领馆申请，或通过CSC在线申请系统直接向目标大学申请。',
    benefits: [
      'Full tuition waiver',
      'Free university accommodation or accommodation subsidy',
      'Monthly stipend: CNY 2,500 (Bachelor), CNY 3,000 (Master), CNY 3,500 (PhD)',
      'Comprehensive medical insurance',
      'One-time intercity travel allowance',
    ],
    benefitsCn: [
      '全额学费减免',
      '免费大学住宿或住宿补贴',
      '月度生活费：2500元（学士），3000元（硕士），3500元（博士）',
      '综合医疗保险',
      '一次性城际交通补贴',
    ],
    officialLink: 'https://studyinchina.csc.edu.cn',
  },
  {
    slug: 'csc-great-wall-program',
    name: 'Chinese Government Scholarship — Great Wall Program',
    nameCn: '中国政府奖学金——长城项目',
    type: 'Full',
    typeCn: '全额',
    coverage: ['Tuition', 'Accommodation', 'Stipend', 'Medical Insurance'],
    coverageCn: ['学费', '住宿', '生活费', '医疗保险'],
    degreeLevels: ['General Scholar', 'Senior Scholar'],
    degreeLevelsCn: ['普通进修生', '高级进修生'],
    eligibleRegions: 'Developing countries and UNESCO member states',
    eligibleRegionsCn: '发展中国家及联合国教科文组织成员国',
    duration: '1 academic year',
    durationCn: '1学年',
    deadline: 'January — April',
    deadlineCn: '1月至4月',
    description: 'The Great Wall Scholarship Program is established by the Ministry of Education for candidates recommended by the United Nations Educational, Scientific and Cultural Organization (UNESCO). It supports general and senior scholars from developing countries to conduct research at Chinese universities.',
    descriptionCn: '长城奖学金项目由教育部设立，面向联合国教科文组织推荐的候选人。支持发展中国家的普通和高级进修生在中国大学进行研修。',
    requirements: [
      'Be a citizen of a developing country',
      'Nominated by UNESCO or recommended by your country\'s UNESCO commission',
      'For General Scholar: at least 2 years of undergraduate study, under age 45',
      'For Senior Scholar: Master degree or above, under age 50',
      'Good health and no criminal record',
    ],
    requirementsCn: [
      '发展中国家公民',
      '由联合国教科文组织提名或本国教科文组织全国委员会推荐',
      '普通进修生：至少2年本科学习，45岁以下',
      '高级进修生：硕士及以上学位，50岁以下',
      '身体健康，无犯罪记录',
    ],
    applicationMethod: 'Apply through UNESCO or your country\'s National Commission for UNESCO.',
    applicationMethodCn: '通过联合国教科文组织或本国教科文组织全国委员会申请。',
    benefits: [
      'Full tuition waiver',
      'Free accommodation',
      'Monthly stipend: CNY 3,000 (General), CNY 3,500 (Senior)',
      'Comprehensive medical insurance',
      'One-time travel allowance',
    ],
    benefitsCn: [
      '全额学费减免',
      '免费住宿',
      '月度生活费：3000元（普通），3500元（高级）',
      '综合医疗保险',
      '一次性交通补贴',
    ],
    officialLink: 'https://studyinchina.csc.edu.cn',
  },
  {
    slug: 'csc-eu-program',
    name: 'Chinese Government Scholarship — EU Program',
    nameCn: '中国政府奖学金——中欧项目',
    type: 'Full',
    typeCn: '全额',
    coverage: ['Tuition', 'Accommodation', 'Stipend', 'Medical Insurance'],
    coverageCn: ['学费', '住宿', '生活费', '医疗保险'],
    degreeLevels: ['Bachelor', 'Master', 'PhD'],
    degreeLevelsCn: ['学士', '硕士', '博士'],
    eligibleRegions: 'European Union member states',
    eligibleRegionsCn: '欧盟成员国',
    duration: '4-5 years (Bachelor), 2-3 years (Master), 3-4 years (PhD)',
    durationCn: '4-5年（学士），2-3年（硕士），3-4年（博士）',
    deadline: 'February — April',
    deadlineCn: '2月至4月',
    description: 'The EU Program is a special category under the Chinese Government Scholarship exclusively for citizens of European Union member states. It aims to strengthen educational exchange and cooperation between China and the EU, supporting students in undergraduate, postgraduate, and doctoral studies.',
    descriptionCn: '中欧项目是中国政府奖学金下的专项类别，专门面向欧盟成员国公民。旨在加强中欧教育交流与合作，支持学生进行本科、研究生和博士阶段的学习。',
    requirements: [
      'Be a citizen of an EU member state',
      'For Bachelor: high school graduate under age 25',
      'For Master: Bachelor degree holder under age 35',
      'For PhD: Master degree holder under age 40',
      'Meet language proficiency requirements',
      'Not currently holding another Chinese government scholarship',
    ],
    requirementsCn: [
      '欧盟成员国公民',
      '学士学位：高中毕业，25岁以下',
      '硕士学位：持有学士学位，35岁以下',
      '博士学位：持有硕士学位，40岁以下',
      '满足语言能力要求',
      '未持有其他中国政府奖学金',
    ],
    applicationMethod: 'Apply through the Chinese embassy in your EU member state or via the CSC online system.',
    applicationMethodCn: '通过驻欧盟成员国的中国使馆或CSC在线系统申请。',
    benefits: [
      'Full tuition waiver',
      'Free accommodation or subsidy',
      'Monthly stipend: CNY 2,500 (Bachelor), CNY 3,000 (Master), CNY 3,500 (PhD)',
      'Comprehensive medical insurance',
    ],
    benefitsCn: [
      '全额学费减免',
      '免费住宿或补贴',
      '月度生活费：2500元（学士），3000元（硕士），3500元（博士）',
      '综合医疗保险',
    ],
    officialLink: 'https://studyinchina.csc.edu.cn',
  },
  {
    slug: 'confucius-institute-scholarship',
    name: 'Confucius Institute Scholarship',
    nameCn: '孔子学院奖学金',
    type: 'Full',
    typeCn: '全额',
    coverage: ['Tuition', 'Accommodation', 'Stipend', 'Medical Insurance'],
    coverageCn: ['学费', '住宿', '生活费', '医疗保险'],
    degreeLevels: ['Language Student (1 semester)', 'Language Student (1 year)', 'Bachelor in Chinese Language', 'Master in Teaching Chinese'],
    degreeLevelsCn: ['语言生（1学期）', '语言生（1学年）', '汉语专业学士', '汉语国际教育硕士'],
    eligibleRegions: 'All countries with Confucius Institutes',
    eligibleRegionsCn: '所有设有孔子学院的国家',
    duration: '1 semester to 4 years depending on program',
    durationCn: '1学期至4年，视项目而定',
    deadline: 'March — May',
    deadlineCn: '3月至5月',
    description: 'The Confucius Institute Scholarship is established by the Confucius Institute Headquarters (Hanban) to support international students, scholars, and Chinese language teachers to study Chinese language and culture at Chinese universities. It is one of the most accessible scholarships for those interested in Chinese language studies.',
    descriptionCn: '孔子学院奖学金由孔子学院总部（汉办）设立，支持国际学生、学者和中文教师在中国大学学习汉语和中国文化。对于有意学习中文的学生来说，这是最容易获得的奖学金之一。',
    requirements: [
      'Be a non-Chinese citizen aged 16-35 (language students 16-35, MTCSOL under 45)',
      'Have HSK test scores (level varies by program)',
      'Recommended by a Confucius Institute or related institution',
      'Good academic record and health',
    ],
    requirementsCn: [
      '非中国籍公民，16-35岁（语言生16-35岁，汉语国际教育硕士45岁以下）',
      '拥有HSK成绩（等级因项目而异）',
      '由孔子学院或相关机构推荐',
      '学业成绩优良，身体健康',
    ],
    applicationMethod: 'Apply through a Confucius Institute in your home country or via the Confucius Institute Scholarship online system.',
    applicationMethodCn: '通过驻在国的孔子学院或孔子学院奖学金在线系统申请。',
    benefits: [
      'Full tuition waiver',
      'Free accommodation',
      'Monthly stipend: CNY 1,400 (language), CNY 1,700 (Bachelor), CNY 3,000 (Master)',
      'Comprehensive medical insurance',
    ],
    benefitsCn: [
      '全额学费减免',
      '免费住宿',
      '月度生活费：1400元（语言），1700元（学士），3000元（硕士）',
      '综合医疗保险',
    ],
    officialLink: 'http://cis.chinese.cn',
  },
  {
    slug: 'mofcom-scholarship',
    name: 'MOFCOM Scholarship',
    nameCn: '商务部奖学金',
    type: 'Full',
    typeCn: '全额',
    coverage: ['Tuition', 'Accommodation', 'Stipend', 'Medical Insurance', 'Round-trip Airfare'],
    coverageCn: ['学费', '住宿', '生活费', '医疗保险', '往返机票'],
    degreeLevels: ['Master', 'PhD'],
    degreeLevelsCn: ['硕士', '博士'],
    eligibleRegions: 'Developing countries (specific list varies annually)',
    eligibleRegionsCn: '发展中国家（具体名单每年有所调整）',
    duration: '2-3 years (Master), 3-4 years (PhD)',
    durationCn: '2-3年（硕士），3-4年（博士）',
    deadline: 'January — April',
    deadlineCn: '1月至4月',
    description: 'The MOFCOM Scholarship is established by the Ministry of Commerce of China to support talented individuals from developing countries to pursue Master\'s or PhD degrees in Economics, Business, and related fields at prestigious Chinese universities. It is one of the most generous scholarships, including round-trip international airfare.',
    descriptionCn: '商务部奖学金由中国商务部设立，支持发展中国家的优秀人才在中国知名大学攻读经济学、商业及相关领域的硕士或博士学位。这是最丰厚的奖学金之一，包括往返国际机票。',
    requirements: [
      'Be a citizen of a developing country on the MOFCOM list',
      'Bachelor degree holder under age 45 for Master programs',
      'Master degree holder for PhD programs',
      'At least 3 years of work experience',
      'Good English proficiency (IELTS 6.0+ or equivalent)',
      'Recommended by your government',
    ],
    requirementsCn: [
      '商务部名单上发展中国家的公民',
      '硕士学位项目：持有学士学位，45岁以下',
      '博士学位项目：持有硕士学位',
      '至少3年工作经验',
      '良好的英语能力（雅思6.0+或同等水平）',
      '由本国政府推荐',
    ],
    applicationMethod: 'Apply through the Economic and Commercial Counsellor\'s Office of the Chinese Embassy in your country.',
    applicationMethodCn: '通过驻在国中国使馆经济商务参赞处申请。',
    benefits: [
      'Full tuition waiver',
      'Free accommodation',
      'Monthly stipend: CNY 3,000 (Master), CNY 3,500 (PhD)',
      'Round-trip international airfare',
      'Comprehensive medical insurance',
      'One-time settlement allowance',
    ],
    benefitsCn: [
      '全额学费减免',
      '免费住宿',
      '月度生活费：3000元（硕士），3500元（博士）',
      '往返国际机票',
      '综合医疗保险',
      '一次性安置补贴',
    ],
    officialLink: 'http://mofcom.gov.cn',
  },
  {
    slug: 'belt-and-road-scholarship',
    name: 'Belt and Road Scholarship',
    nameCn: '"一带一路"奖学金',
    type: 'Full',
    typeCn: '全额',
    coverage: ['Tuition', 'Accommodation', 'Stipend', 'Medical Insurance'],
    coverageCn: ['学费', '住宿', '生活费', '医疗保险'],
    degreeLevels: ['Bachelor', 'Master', 'PhD'],
    degreeLevelsCn: ['学士', '硕士', '博士'],
    eligibleRegions: 'Belt and Road Initiative partner countries',
    eligibleRegionsCn: '"一带一路"合作伙伴国家',
    duration: '4-5 years (Bachelor), 2-3 years (Master), 3-4 years (PhD)',
    durationCn: '4-5年（学士），2-3年（硕士），3-4年（博士）',
    deadline: 'January — April (varies by university)',
    deadlineCn: '1月至4月（因大学而异）',
    description: 'The Belt and Road Scholarship is a national-level initiative to support students from countries along the Belt and Road to study in China. It focuses on disciplines aligned with BRI cooperation areas including engineering, infrastructure, trade, and international relations. The scholarship is administered through designated Chinese universities.',
    descriptionCn: '"一带一路"奖学金是国家级倡议，支持"一带一路"沿线国家学生来华留学。侧重于与"一带一路"合作领域相关的学科，包括工程、基础设施、贸易和国际关系。该奖学金通过指定的中国大学管理。',
    requirements: [
      'Be a citizen of a Belt and Road partner country',
      'Meet the academic requirements for the chosen degree level',
      'For Bachelor: high school graduate under age 25',
      'For Master: Bachelor degree holder under age 35',
      'For PhD: Master degree holder under age 40',
      'Priority given to students in BRI-related fields',
    ],
    requirementsCn: [
      '"一带一路"合作伙伴国家公民',
      '满足所选学位层次的学术要求',
      '学士学位：高中毕业，25岁以下',
      '硕士学位：持有学士学位，35岁以下',
      '博士学位：持有硕士学位，40岁以下',
      '优先考虑"一带一路"相关领域的学生',
    ],
    applicationMethod: 'Apply directly to designated Chinese universities that offer the Belt and Road Scholarship, or through the Chinese embassy in your country.',
    applicationMethodCn: '直接向提供"一带一路"奖学金的指定中国大学申请，或通过驻在国中国使馆申请。',
    benefits: [
      'Full tuition waiver',
      'Free accommodation or subsidy',
      'Monthly stipend: CNY 2,500–3,500 depending on degree level',
      'Comprehensive medical insurance',
      'Research and conference allowance for graduate students',
    ],
    benefitsCn: [
      '全额学费减免',
      '免费住宿或补贴',
      '月度生活费：2500-3500元，视学位层次而定',
      '综合医疗保险',
      '研究生科研和会议补贴',
    ],
    officialLink: 'https://studyinchina.csc.edu.cn',
  },
  {
    slug: 'beijing-government-scholarship',
    name: 'Beijing Government Scholarship',
    nameCn: '北京市外国留学生奖学金',
    type: 'Partial',
    typeCn: '部分',
    coverage: ['Tuition (partial or full)'],
    coverageCn: ['学费（部分或全额）'],
    degreeLevels: ['Bachelor', 'Master', 'PhD', 'Language Student'],
    degreeLevelsCn: ['学士', '硕士', '博士', '语言生'],
    eligibleRegions: 'All countries',
    eligibleRegionsCn: '所有国家',
    duration: '1 academic year (renewable)',
    durationCn: '1学年（可续）',
    deadline: 'February — May',
    deadlineCn: '2月至5月',
    description: 'The Beijing Government Scholarship is a municipal-level scholarship established by the Beijing Municipal Government to attract outstanding international students to study at universities in Beijing. It provides partial or full tuition coverage and is available for all degree levels.',
    descriptionCn: '北京市外国留学生奖学金是北京市政府设立的市级奖学金，旨在吸引优秀国际学生到北京的高校学习。提供部分或全额学费资助，适用于所有学位层次。',
    requirements: [
      'Be a non-Chinese citizen in good health',
      'Applying to or currently studying at a Beijing university',
      'Good academic performance',
      'For new students: meet the university admission requirements',
      'For continuing students: GPA requirements vary by university',
    ],
    requirementsCn: [
      '非中国籍公民，身体健康',
      '申请或正在北京高校就读',
      '学业成绩优良',
      '新生：满足大学入学要求',
      '在校生：GPA要求因大学而异',
    ],
    applicationMethod: 'Apply directly through your target or current Beijing university\'s international student office.',
    applicationMethodCn: '直接通过目标或就读的北京高校留学生办公室申请。',
    benefits: [
      'Partial or full tuition waiver (amount varies by degree and university)',
      'Bachelor: up to CNY 20,000/year',
      'Master: up to CNY 30,000/year',
      'PhD: up to CNY 40,000/year',
    ],
    benefitsCn: [
      '部分或全额学费减免（金额因学位和大学而异）',
      '学士：最高20000元/年',
      '硕士：最高30000元/年',
      '博士：最高40000元/年',
    ],
    officialLink: 'http://beijing.gov.cn',
  },
  {
    slug: 'shanghai-government-scholarship',
    name: 'Shanghai Government Scholarship',
    nameCn: '上海市外国留学生奖学金',
    type: 'Partial',
    typeCn: '部分',
    coverage: ['Tuition (partial or full)', 'Living allowance (Type A)'],
    coverageCn: ['学费（部分或全额）', '生活费（A类）'],
    degreeLevels: ['Bachelor', 'Master', 'PhD', 'Language Student'],
    degreeLevelsCn: ['学士', '硕士', '博士', '语言生'],
    eligibleRegions: 'All countries',
    eligibleRegionsCn: '所有国家',
    duration: '1 academic year (renewable)',
    durationCn: '1学年（可续）',
    deadline: 'January — April',
    deadlineCn: '1月至4月',
    description: 'The Shanghai Government Scholarship is established by the Shanghai Municipal Education Commission. It offers three types of scholarships — Type A (full scholarship), Type B (partial scholarship for tuition), and Type C (partial scholarship for outstanding students already in Shanghai). It is one of the most popular provincial-level scholarships.',
    descriptionCn: '上海市外国留学生奖学金由上海市教育委员会设立。提供三类奖学金——A类（全额奖学金）、B类（部分学费奖学金）和C类（在沪优秀学生部分奖学金）。是最受欢迎的省级奖学金之一。',
    requirements: [
      'Be a non-Chinese citizen in good health',
      'Applying to or studying at a Shanghai university',
      'Type A: excellent academic record, under age 30 (Bachelor), 35 (Master), 40 (PhD)',
      'Type B: good academic performance',
      'Type C: continuing students with outstanding academic results',
    ],
    requirementsCn: [
      '非中国籍公民，身体健康',
      '申请或正在上海高校就读',
      'A类：学业成绩优异，30岁以下（学士），35岁以下（硕士），40岁以下（博士）',
      'B类：学业成绩良好',
      'C类：在校生学业成绩突出',
    ],
    applicationMethod: 'Apply through the international student office of your target or current Shanghai university.',
    applicationMethodCn: '通过目标或就读的上海高校留学生办公室申请。',
    benefits: [
      'Type A: Full tuition + CNY 2,000-3,000/month living allowance',
      'Type B: Tuition waiver (up to CNY 20,000-65,000/year depending on degree)',
      'Type C: Partial tuition support for outstanding continuing students',
    ],
    benefitsCn: [
      'A类：全额学费+2000-3000元/月生活费',
      'B类：学费减免（最高20000-65000元/年，视学位而定）',
      'C类：优秀在校生部分学费资助',
    ],
    officialLink: 'http://study-shanghai.org',
  },
  {
    slug: 'csc-aun-program',
    name: 'Chinese Government Scholarship — AUN Program',
    nameCn: '中国政府奖学金——东盟大学网络项目',
    type: 'Full',
    typeCn: '全额',
    coverage: ['Tuition', 'Accommodation', 'Stipend', 'Medical Insurance'],
    coverageCn: ['学费', '住宿', '生活费', '医疗保险'],
    degreeLevels: ['Master', 'PhD'],
    degreeLevelsCn: ['硕士', '博士'],
    eligibleRegions: 'ASEAN member states (through AUN member universities)',
    eligibleRegionsCn: '东盟成员国（通过AUN成员大学）',
    duration: '2-3 years (Master), 3-4 years (PhD)',
    durationCn: '2-3年（硕士），3-4年（博士）',
    deadline: 'January — March',
    deadlineCn: '1月至3月',
    description: 'The AUN Program is a special category under the Chinese Government Scholarship designed for students from ASEAN member states. It is managed through the ASEAN University Network (AUN) and supports postgraduate studies at top Chinese universities. The program aims to strengthen China-ASEAN educational cooperation.',
    descriptionCn: '东盟大学网络项目是中国政府奖学金下的专项类别，面向东盟成员国学生。通过东盟大学网络（AUN）管理，支持在顶尖中国大学的研究生学习。旨在加强中国-东盟教育合作。',
    requirements: [
      'Be a citizen of an ASEAN member state',
      'Recommended by an AUN member university',
      'For Master: Bachelor degree holder under age 35',
      'For PhD: Master degree holder under age 40',
      'Meet language proficiency requirements',
    ],
    requirementsCn: [
      '东盟成员国公民',
      '由AUN成员大学推荐',
      '硕士：持有学士学位，35岁以下',
      '博士：持有硕士学位，40岁以下',
      '满足语言能力要求',
    ],
    applicationMethod: 'Apply through an AUN member university in your country, which will nominate you to the AUN Secretariat.',
    applicationMethodCn: '通过本国的AUN成员大学申请，由该大学向AUN秘书处提名。',
    benefits: [
      'Full tuition waiver',
      'Free accommodation',
      'Monthly stipend: CNY 3,000 (Master), CNY 3,500 (PhD)',
      'Comprehensive medical insurance',
      'One-time travel allowance',
    ],
    benefitsCn: [
      '全额学费减免',
      '免费住宿',
      '月度生活费：3000元（硕士），3500元（博士）',
      '综合医疗保险',
      '一次性交通补贴',
    ],
    officialLink: 'https://studyinchina.csc.edu.cn',
  },
  {
    slug: 'maritime-scholarship-program',
    name: 'Maritime Scholarship Program',
    nameCn: '中国政府海事奖学金',
    type: 'Full',
    typeCn: '全额',
    coverage: ['Tuition', 'Accommodation', 'Stipend', 'Medical Insurance'],
    coverageCn: ['学费', '住宿', '生活费', '医疗保险'],
    degreeLevels: ['Bachelor', 'Master', 'PhD'],
    degreeLevelsCn: ['学士', '硕士', '博士'],
    eligibleRegions: 'All countries (priority to developing maritime nations)',
    eligibleRegionsCn: '所有国家（优先发展中海洋国家）',
    duration: '4-5 years (Bachelor), 2-3 years (Master), 3-4 years (PhD)',
    durationCn: '4-5年（学士），2-3年（硕士），3-4年（博士）',
    deadline: 'January — April',
    deadlineCn: '1月至4月',
    description: 'The Maritime Scholarship Program is a specialized scholarship for international students interested in maritime studies, oceanography, naval architecture, marine engineering, and related fields. Administered by designated maritime universities in China, it aims to cultivate global maritime talent and promote international cooperation in ocean-related fields.',
    descriptionCn: '中国政府海事奖学金是面向有意从事海事研究、海洋学、船舶与海洋工程及相关领域学习的国际学生的专项奖学金。由中国指定的海事大学管理，旨在培养全球海事人才，促进海洋领域的国际合作。',
    requirements: [
      'Be a non-Chinese citizen in good health',
      'For Bachelor: high school graduate under age 25',
      'For Master: Bachelor degree in related field, under age 35',
      'For PhD: Master degree in related field, under age 40',
      'Interest in maritime/ocean studies',
      'Recommended by your home country or institution',
    ],
    requirementsCn: [
      '非中国籍公民，身体健康',
      '学士：高中毕业，25岁以下',
      '硕士：相关领域学士学位，35岁以下',
      '博士：相关领域硕士学位，40岁以下',
      '对海事/海洋研究有兴趣',
      '由本国或所在机构推荐',
    ],
    applicationMethod: 'Apply through designated maritime universities in China or the Chinese embassy in your country.',
    applicationMethodCn: '通过中国指定的海事大学或驻在国中国使馆申请。',
    benefits: [
      'Full tuition waiver',
      'Free accommodation',
      'Monthly stipend: CNY 2,500 (Bachelor), CNY 3,000 (Master), CNY 3,500 (PhD)',
      'Comprehensive medical insurance',
      'Practical training opportunities at maritime facilities',
    ],
    benefitsCn: [
      '全额学费减免',
      '免费住宿',
      '月度生活费：2500元（学士），3000元（硕士），3500元（博士）',
      '综合医疗保险',
      '海事设施实习机会',
    ],
    officialLink: 'https://studyinchina.csc.edu.cn',
  },
];

export const scholarshipTypes = ['Full', 'Partial'];
export const scholarshipTypesCn = ['全额', '部分'];
export const scholarshipDegreeLevels = ['Bachelor', 'Master', 'PhD', 'Language Student', 'General Scholar', 'Senior Scholar'];
export const scholarshipDegreeLevelsCn = ['学士', '硕士', '博士', '语言生', '普通进修生', '高级进修生'];

export interface Lead {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  countryCn: string;
  highestEducation: string;
  highestEducationCn: string;
  currentMajor: string;
  currentMajorCn: string;
  hskScore: number;
  ieltsScore: number;
  toeflScore: number;
  targetUniversities: string[];
  targetPrograms: string[];
  intendedIntake: string;
  intendedIntakeCn: string;
  source: string;
  sourceCn: string;
  status: 'New' | 'In Progress' | 'Converted' | 'Lost';
  statusCn: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const leadSources = ['Website', 'Referral', 'Education Fair', 'Social Media', 'Agent', 'Other'];
export const leadSourcesCn = ['网站', '推荐', '教育展', '社交媒体', '中介', '其他'];

export const leadStatuses = ['New', 'In Progress', 'Converted', 'Lost'];
export const leadStatusesCn = ['新线索', '跟进中', '已转化', '已流失'];

export const educationLevels = ['High School', 'Bachelor', 'Master', 'PhD', 'Other'];
export const educationLevelsCn = ['高中', '学士', '硕士', '博士', '其他'];

export interface Assessment {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  country: string;
  countryCn: string;
  dateOfBirth: string;
  currentEducation: string;
  currentEducationCn: string;
  intendedMajor: string;
  intendedMajorCn: string;
  targetUniversities: string[];
  transcriptUrl: string;
  additionalNotes: string;
  status: 'Pending' | 'Reviewing' | 'Completed';
  statusCn: string;
  assessmentResult: string;
  assessmentResultCn: string;
  createdAt: string;
  updatedAt: string;
}

export const assessmentStatuses = ['Pending', 'Reviewing', 'Completed'];
export const assessmentStatusesCn = ['待审核', '审核中', '已完成'];

export function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Extended Application type for Chinese university international student applications
export interface ExtendedApplication {
  id: string;
  applicationNumber: string;
  
  // Basic Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  
  // Contact Information
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  postalCode: string;
  
  // Education Background - High School
  highSchoolName: string;
  highSchoolCity: string;
  highSchoolCountry: string;
  highSchoolAddress: string;
  highSchoolGraduationDate: string;
  highSchoolGPA: string;
  highSchoolTranscriptUrl: string;
  
  // Education Background - Bachelor's (if applicable)
  bachelorUniversity: string;
  bachelorUniversityName: string;
  bachelorUniversityAddress: string;
  bachelorMajor: string;
  bachelorGPA: string;
  bachelorGraduationDate: string;
  bachelorTranscriptUrl: string;
  bachelorDegreeCertificateUrl: string;
  
  // Education Background - Master's (if applicable)
  masterUniversity: string;
  masterUniversityName: string;
  masterUniversityAddress: string;
  masterMajor: string;
  masterGPA: string;
  masterGraduationDate: string;
  masterTranscriptUrl: string;
  masterDegreeCertificateUrl: string;
  
  // Language Proficiency
  hskLevel: string;
  hskScore: string;
  hskCertificateUrl: string;
  ieltsScore: string;
  ieltsCertificateUrl: string;
  toeflScore: string;
  toeflCertificateUrl: string;
  
  // Application Intent - Multiple Universities Support
  targetUniversities: string[]; // Array of university slugs
  targetProgram: string;
  targetProgramName: string;
  targetProgramSlug: string;
  targetDegreeLevel: 'Bachelor' | 'Master' | 'PhD';
  intendedIntake: string; // e.g., "2024 Fall"
  
  // Application Documents
  personalStatement: string;
  personalStatementFileUrl: string;
  recommendationLetters: string;
  recommendationLetter1Url: string;
  recommendationLetter2Url: string;
  transcriptUrl: string;
  passportCopyUrl: string;
  passportScanUrl: string;
  photoUrl: string;
  physicalExaminationUrl: string;
  nonCriminalRecordUrl: string;
  financialProofUrl: string;
  otherDocuments: string;
  
  // Internal Management
  status: 'Pending' | 'Reviewing' | 'Documents Requested' | 'Decision Made' | 'Accepted' | 'Rejected';
  internalNotes: string;
  adminAssigned: string;
  assignedAdmin: string;
  decisionLetterUrl: string;
  
  createdAt: string;
  updatedAt: string;
}

export const applicationStatuses = ['Pending', 'Reviewing', 'Documents Requested', 'Decision Made', 'Accepted', 'Rejected'];

export const genders = ['Male', 'Female', 'Other'];
export const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
export const intendedIntakes = ['2024 Fall', '2025 Spring', '2025 Fall', '2026 Spring'];

// ==================== Partner Portal Types ====================

export interface Partner {
  id: string;
  slug: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  country: string;
  address?: string;
  logoUrl?: string;
  website?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  serviceRate: number; // percentage
  depositAmount: number;
  serviceChargeAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerStudent {
  id: string;
  partnerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber?: string;
  gender?: 'Male' | 'Female' | 'Other';
  currentEducation?: string;
  targetDegreeLevel?: 'Bachelor' | 'Master' | 'PhD';
  targetProgram?: string;
  targetUniversities?: string[];
  transcriptUrl?: string;
  passportCopyUrl?: string;
  personalStatement?: string;
  status: 'New' | 'In Progress' | 'Applied' | 'Accepted' | 'Rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerApplication {
  id: string;
  partnerId: string;
  studentId: string;
  universitySlug: string;
  programSlug: string;
  intendedIntake: string;
  applicationNumber?: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Documents Requested' | 'Decision Made' | 'Accepted' | 'Rejected';
  documents?: {
    type: string;
    url: string;
    uploadedAt: string;
  }[];
  notes?: string;
  decisionLetterUrl?: string;
  submittedAt?: string;
  decisionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCharge {
  id: string;
  partnerId: string;
  studentId?: string;
  applicationId?: string;
  type: 'Deposit' | 'Service Charge';
  amount: number;
  currency: string;
  status: 'Pending' | 'Paid' | 'Refunded';
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadShare {
  id: string;
  fromPartnerId: string;
  toPartnerId: string;
  leadId: string;
  leadType: 'Student' | 'Application';
  status: 'Pending' | 'Accepted' | 'Declined';
  message?: string;
  acceptedAt?: string;
  declinedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const partnerStatuses = ['Active', 'Inactive', 'Suspended'] as const;
export const partnerStudentStatuses = ['New', 'In Progress', 'Applied', 'Accepted', 'Rejected'] as const;
export const partnerApplicationStatuses = ['Draft', 'Submitted', 'Under Review', 'Documents Requested', 'Decision Made', 'Accepted', 'Rejected'] as const;
export const serviceChargeTypes = ['Deposit', 'Service Charge'] as const;
export const serviceChargeStatuses = ['Pending', 'Paid', 'Refunded'] as const;
export const leadShareStatuses = ['Pending', 'Accepted', 'Declined'] as const;

// Document Management Types
export type DocumentCategory = 'Student Basic' | 'Academic' | 'Application Specific';
export type DocumentStatus = 'Pending' | 'Uploaded' | 'Verified' | 'Rejected' | 'Expired';
export type DegreeLevel = 'Bachelor' | 'Master' | 'PhD';

export interface DocumentType {
  id: string;
  name: string;
  nameCn: string;
  category: DocumentCategory;
  requiredFor: DegreeLevel[];
  description: string;
  descriptionCn: string;
  required: boolean;
  fileTypes: string[];
  maxSizeMB: number;
}

export interface StudentDocument {
  id: string;
  studentId: string;
  documentTypeId: string;
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  documentTypeId: string;
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  notes?: string;
  // Document sync fields
  sourceStudentDocumentId?: string;
  isSynced?: boolean;
  syncStatus?: 'Synced' | 'Modified' | 'Detached';
}

// Document Type Definitions
export const documentTypes: DocumentType[] = [
  // Student Basic Documents
  {
    id: 'passport-copy',
    name: 'Passport Copy',
    nameCn: '护照扫描件',
    category: 'Student Basic',
    requiredFor: ['Bachelor', 'Master', 'PhD'],
    description: 'Clear color copy of passport information page',
    descriptionCn: '护照信息页的清晰彩色扫描件',
    required: true,
    fileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMB: 5
  },
  {
    id: 'passport-photo',
    name: 'Passport-size Photo',
    nameCn: '护照照片',
    category: 'Student Basic',
    requiredFor: ['Bachelor', 'Master', 'PhD'],
    description: 'Recent passport-size color photo with white background',
    descriptionCn: '近期白色背景护照尺寸彩色照片',
    required: true,
    fileTypes: ['.jpg', '.jpeg', '.png'],
    maxSizeMB: 2
  },
  {
    id: 'cv-personal-statement',
    name: 'CV / Personal Statement',
    nameCn: '简历/个人陈述',
    category: 'Student Basic',
    requiredFor: ['Bachelor', 'Master', 'PhD'],
    description: 'Curriculum Vitae or Personal Statement',
    descriptionCn: '简历或个人陈述',
    required: true,
    fileTypes: ['.pdf', '.doc', '.docx'],
    maxSizeMB: 5
  },
  {
    id: 'language-proficiency',
    name: 'Language Proficiency Certificate',
    nameCn: '语言成绩证明',
    category: 'Student Basic',
    requiredFor: ['Bachelor', 'Master', 'PhD'],
    description: 'HSK (Chinese), IELTS, or TOEFL score report',
    descriptionCn: 'HSK（汉语）、雅思或托福成绩单',
    required: true,
    fileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMB: 5
  },
  {
    id: 'physical-examination',
    name: 'Physical Examination Report',
    nameCn: '体检证明',
    category: 'Student Basic',
    requiredFor: ['Bachelor', 'Master', 'PhD'],
    description: 'Foreigners Physical Examination Form (within last 6 months)',
    descriptionCn: '外国人体格检查记录（6个月内）',
    required: true,
    fileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMB: 5
  },
  {
    id: 'non-criminal-record',
    name: 'Non-Criminal Record Certificate',
    nameCn: '无犯罪记录证明',
    category: 'Student Basic',
    requiredFor: ['Master', 'PhD'],
    description: 'Certificate of good conduct from home country police',
    descriptionCn: '本国警方出具的无犯罪记录证明',
    required: false,
    fileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMB: 5
  },
  // Academic Documents - Bachelor
  {
    id: 'high-school-transcript',
    name: 'High School Transcript',
    nameCn: '高中成绩单',
    category: 'Academic',
    requiredFor: ['Bachelor'],
    description: 'Official high school academic transcript with grades',
    descriptionCn: '官方高中成绩单',
    required: true,
    fileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMB: 5
  },
  {
    id: 'high-school-diploma',
    name: 'High School Diploma',
    nameCn: '高中毕业证',
    category: 'Academic',
    requiredFor: ['Bachelor'],
    description: 'High school graduation certificate or equivalent',
    descriptionCn: '高中毕业证书或同等学历证明',
    required: true,
    fileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMB: 5
  },
  // Academic Documents - Master/PhD
  {
    id: 'bachelor-transcript',
    name: "Bachelor's Degree Transcript",
    nameCn: '本科成绩单',
    category: 'Academic',
    requiredFor: ['Master', 'PhD'],
    description: 'Official bachelor\'s degree academic transcript',
    descriptionCn: '官方本科成绩单',
    required: true,
    fileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMB: 5
  },
  {
    id: 'bachelor-diploma',
    name: "Bachelor's Degree Diploma",
    nameCn: '本科毕业证',
    category: 'Academic',
    requiredFor: ['Master', 'PhD'],
    description: 'Bachelor\'s degree graduation certificate',
    descriptionCn: '本科毕业证书',
    required: true,
    fileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMB: 5
  },
  {
    id: 'degree-certificate',
    name: 'Degree Certificate',
    nameCn: '学位证',
    category: 'Academic',
    requiredFor: ['Master', 'PhD'],
    description: 'Official bachelor\'s degree certificate',
    descriptionCn: '官方学士学位证书',
    required: true,
    fileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMB: 5
  },
  {
    id: 'recommendation-letters',
    name: 'Recommendation Letters',
    nameCn: '推荐信',
    category: 'Academic',
    requiredFor: ['Master', 'PhD'],
    description: '2-3 academic recommendation letters from professors',
    descriptionCn: '2-3封教授的学术推荐信',
    required: true,
    fileTypes: ['.pdf', '.doc', '.docx'],
    maxSizeMB: 10
  },
  {
    id: 'research-proposal',
    name: 'Research Proposal',
    nameCn: '研究计划',
    category: 'Academic',
    requiredFor: ['Master', 'PhD'],
    description: 'Research proposal for graduate studies',
    descriptionCn: '研究生学习研究计划',
    required: false,
    fileTypes: ['.pdf', '.doc', '.docx'],
    maxSizeMB: 10
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    nameCn: '作品集',
    category: 'Academic',
    requiredFor: [],
    description: 'Portfolio for art and design programs',
    descriptionCn: '艺术和设计专业作品集',
    required: false,
    fileTypes: ['.pdf', '.zip'],
    maxSizeMB: 50
  },
  // Application Specific Documents
  {
    id: 'application-form',
    name: 'Application Form',
    nameCn: '申请表格',
    category: 'Application Specific',
    requiredFor: ['Bachelor', 'Master', 'PhD'],
    description: 'University application form',
    descriptionCn: '大学申请表',
    required: true,
    fileTypes: ['.pdf', '.doc', '.docx'],
    maxSizeMB: 5
  },
  {
    id: 'financial-guarantee',
    name: 'Financial Guarantee',
    nameCn: '经济担保证明',
    category: 'Application Specific',
    requiredFor: ['Bachelor', 'Master', 'PhD'],
    description: 'Financial guarantee letter from sponsor',
    descriptionCn: '担保人经济担保信',
    required: true,
    fileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMB: 5
  },
  {
    id: 'bank-statement',
    name: 'Bank Statement',
    nameCn: '银行存款证明',
    category: 'Application Specific',
    requiredFor: ['Bachelor', 'Master', 'PhD'],
    description: 'Bank statement showing sufficient funds',
    descriptionCn: '显示充足资金的银行存款证明',
    required: true,
    fileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMB: 5
  },
  {
    id: 'insurance-certificate',
    name: 'Insurance Certificate',
    nameCn: '保险证明',
    category: 'Application Specific',
    requiredFor: [],
    description: 'Medical insurance certificate (if applicable)',
    descriptionCn: '医疗保险证明（如适用）',
    required: false,
    fileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMB: 5
  }
];

// ==================== FEES ====================
//
// AdminFee type + adminFeeStatuses + adminFeeTypes + mockAdminFees are
// now in src/app/admin/fees/page.tsx (local interface) and via the
// /api/admin/fees endpoint. Real data flows from student_fees table.

export const documentCategories: DocumentCategory[] = ['Student Basic', 'Academic', 'Application Specific'];
export const documentStatuses: DocumentStatus[] = ['Pending', 'Uploaded', 'Verified', 'Rejected', 'Expired'];
export const degreeLevels: DegreeLevel[] = ['Bachelor', 'Master', 'PhD'];

export const documentStatusColors: Record<DocumentStatus, string> = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Uploaded': 'bg-blue-100 text-blue-800',
  'Verified': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Expired': 'bg-gray-100 text-gray-800'
};

export const documentCategoryNames: Record<DocumentCategory, { en: string; zh: string }> = {
  'Student Basic': { en: 'Student Basic', zh: '学生基础' },
  'Academic': { en: 'Academic', zh: '学术' },
  'Application Specific': { en: 'Application Specific', zh: '申请特定' }
};

export const nationalities = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Italy', 'Spain', 'Netherlands', 'Belgium',
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland',
  'Japan', 'South Korea', 'Singapore', 'Malaysia', 'Indonesia',
  'Thailand', 'Vietnam', 'India', 'Pakistan', 'Bangladesh',
  'Nigeria', 'Kenya', 'South Africa', 'Egypt', 'Morocco',
  'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia',
  'Russia', 'Ukraine', 'Poland', 'Czech Republic', 'Hungary',
  'Romania', 'Bulgaria', 'Greece', 'Cyprus', 'Turkey',
  'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Oman',
  'Israel', 'Jordan', 'Lebanon', 'Egypt', 'Tunisia'
];

// ==================== ADMIN STUDENT & APPLICATION TYPES ====================
//
// AdminStudent type + AdminStudentSource + AdminStudentStatus are now in
// src/lib/student-mapper.ts. Data flows through /api/admin/students.
// mockAdminStudents is gone — use the useStudentList hook instead.
