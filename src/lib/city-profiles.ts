/** Qualitative city guidance. Sources are displayed with each climate/transport note. */
export interface CityProfile {
  summary: { en: string; zh: string };
  climate: { en: string; zh: string };
  climateSource: string;
  transport: { en: string; zh: string };
  transportSource?: string;
}
export const cityProfiles: Record<string, CityProfile> = {
  beijing: {
    summary: { en: 'Historic neighbourhoods, major research campuses, and a capital-city setting.', zh: '历史街区、研究型大学与首都生活，在这里交汇。' },
    climate: { en: 'Hot, rainy summers and cold, dry winters. Pack for a clear change between seasons.', zh: '夏季炎热多雨，冬季寒冷干燥，行李需兼顾不同季节。' },
    climateSource: 'https://english.beijing.gov.cn/beijinginfo/facts/demographicgeography/202005/t20200518_1900888.html',
    transport: { en: 'Use the student transport guide to plan the journey to your actual campus before choosing accommodation.', zh: '先用留学生交通指南规划前往实际校区的路线，再选择住宿。' },
    transportSource: 'https://english.beijing.gov.cn/specials/completeguidetostudyinginbeijing/proceduresafterarrival/202604/t20260427_4616901.html',
  },
  shanghai: {
    summary: { en: 'A riverside metropolis where historic streets meet a modern international skyline.', zh: '历史街区与现代天际线相映的国际化滨江都市。' },
    climate: { en: 'Four distinct seasons, with hot, humid summers and cold, damp winters.', zh: '四季分明，夏季炎热潮湿，冬季湿冷。' },
    climateSource: 'https://english.shanghai.gov.cn/en-Overview/20241225/ce046a2a1e754fde8c02804d6d66db18.html',
    transport: { en: 'Metro, bus, ferry and rail options connect different parts of Shanghai. Compare the full commute to your campus.', zh: '地铁、公交、轮渡与铁路连接上海各区域，选房时请比较到校区的完整通勤路线。' },
    transportSource: 'https://english.shanghai.gov.cn/en-Individuals-Transportation/index.html',
  },
  guangzhou: {
    summary: { en: 'Pearl River city life, Cantonese culture, and a gateway to southern China.', zh: '珠江都市生活、岭南文化与华南门户。' },
    climate: { en: 'Warm, rainy conditions and a long summer. Consider ventilation and cooling when comparing rooms.', zh: '气候温暖多雨、夏季较长，比较房源时可关注通风与制冷条件。' },
    climateSource: 'https://webresource.airchina.com.cn/en-US/content/travel_info/preparing/conditions/destination/china/can/',
    transport: { en: 'Check the exact campus address and airport or railway arrival point before planning your first journey.', zh: '规划首次出行前，先确认具体校区地址及抵达的机场或火车站。' },
  },
  hangzhou: {
    summary: { en: 'West Lake, historic waterways, and university life in Zhejiang’s capital.', zh: '西湖、历史水道与浙江省会的大学生活。' },
    climate: { en: 'A humid monsoon climate with distinct seasons and ample rainfall. Bring rainwear for daily travel.', zh: '湿润季风气候、四季分明且雨水充足，日常出行可备好雨具。' },
    climateSource: 'https://www.ehangzhou.gov.cn/2018-06/14/c_242687_2.htm',
    transport: { en: 'Confirm which campus hosts your program; a university name alone is not enough to choose a nearby room.', zh: '请确认专业所在的具体校区，仅凭大学名称不足以选择附近住宿。' },
  },
  nanjing: {
    summary: { en: 'Historic city walls and a broad choice of universities in Jiangsu’s capital.', zh: '历史城墙与众多高校，共同构成江苏省会的留学生活。' },
    climate: { en: 'Distinct seasons, with a summer rainy period. Prepare clothing for both summer and winter.', zh: '四季分明，夏季有梅雨期，衣物需兼顾夏冬两季。' },
    climateSource: 'https://tb.nanjing.gov.cn/njjj/dlgm/202108/t20210826_3112826.html',
    transport: { en: 'The city’s living guide links to transport information. Use your campus address when planning a commute.', zh: '南京生活指南提供交通信息入口，规划通勤时请以校区地址为准。' },
    transportSource: 'https://english.nanjing.gov.cn/LivinginNanjing/',
  },
  wuhan: {
    summary: { en: 'A university city shaped by the Yangtze and Han rivers, with lakes and riverside neighbourhoods.', zh: '长江与汉江交汇、湖泊与滨江街区环绕的大学城市。' },
    climate: { en: 'A humid subtropical monsoon climate, with four seasons and abundant rainfall.', zh: '亚热带湿润季风气候，四季分明，降雨充足。' },
    climateSource: 'https://english.wuhan.gov.cn/investment/overview4of4investment4climate4in4wuhan/202110/t20211026_1819764.shtml',
    transport: { en: 'Check the city transport guide and your campus location when comparing journeys across the river.', zh: '比较跨江通勤路线时，请结合城市交通指南与具体校区位置。' },
    transportSource: 'https://english.wuhan.gov.cn/travel/transportation/',
  },
  chengdu: {
    summary: { en: 'Sichuan’s capital, with a distinctive food culture and university campuses across the city.', zh: '独具饮食文化、大学校区遍布的四川省会。' },
    climate: { en: 'A humid subtropical basin climate with seasonal changes. Compare the heating and cooling provided in each room.', zh: '湿润的亚热带盆地气候，季节变化明显，可比较不同房间的供暖与制冷条件。' },
    climateSource: 'https://www.weather.com.cn/html/cityintro_en/101270101.shtml',
    transport: { en: 'Compare travel time from your room to the teaching campus, rather than distance to the city centre.', zh: '比较住宿时，优先考虑到教学所在校区的时间，而非仅看到市中心的距离。' },
  },
  shenzhen: {
    summary: { en: 'A coastal city neighbouring Hong Kong, known for its technology and design industries.', zh: '毗邻香港、以科技与设计产业闻名的滨海城市。' },
    climate: { en: 'Long, warm summers and mild winters. Plan for humidity and frequent use of air conditioning.', zh: '夏季较长、冬季温和，可为潮湿天气与室内空调环境做好准备。' },
    climateSource: 'https://www.sz.gov.cn/en_szgov/travel/guide/',
    transport: { en: 'Metro and high-speed rail are part of the city’s transport network. Check campus access before choosing a district.', zh: '城市交通网络包括地铁与高铁，选择居住区域前请确认前往校区的交通方式。' },
    transportSource: 'https://www.sz.gov.cn/en_szgov/travel/guide/',
  },
};
