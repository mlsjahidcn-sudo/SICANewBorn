-- Phase 162: Seed the 5 featured universities + their programs
-- + per-school scholarships + the active webinar session for
-- 20 October 2026 + 20 university-card-section topics
-- (4 per university, kind = program | scholarship | timing |
-- requirement).
--
-- Idempotent via ON CONFLICT (slug) DO UPDATE everywhere —
-- re-running the migration refreshes content rather than
-- erroring. The single-active partial index on webinar_sessions
-- is naturally safe because we match on slug (not on is_active)
-- and our UPSERTed row IS the active row.
--
-- Content sourced from each school's U-HR public profile +
-- ministry ranking tables. Numbers are conservative — anything
-- the admin disagrees with is editable in /admin/universities.

-- ============================================
-- 1. Universities (5 rows)
-- ============================================

INSERT INTO public.universities (
  slug, name, name_cn, city, city_cn, ranking, rating, type, type_cn,
  established, students, intl_students,
  description, description_cn,
  popular_programs, popular_programs_cn,
  tuition_undergrad, tuition_graduate,
  intake, intake_cn,
  disciplines, logo, qs_ranking, qs_world_ranking,
  highlights_en, highlights_zh,
  tags, tags_cn,
  accommodation, accommodation_cn,
  accommodation_cost, accommodation_cost_cn,
  accommodation_types, accommodation_types_cn
) VALUES
('south-china-university-of-technology',
 'South China University of Technology', '华南理工大学',
 'Guangzhou', '广州', 25, 4.6, 'Public University', '公立大学',
 1918, '43,000+', '2,000+',
 'SCUT is a 985/211/DFC research powerhouse in Guangzhou, particularly renowned for engineering, materials, and architecture. It maintains strong industry partnerships in the Greater Bay Area and is one of the four major engineering institutes historically affiliated with the former Ministry of Education.',
 '华南理工大学是位于广州的 985/211/双一流研究型大学，以工程、材料和建筑学闻名。在大湾区保持深厚的产业联系，是历史上隶属于原教育部的四大工学院之一。',
 ARRAY['Chemical Engineering','Computer Science','Architecture','Materials Science','Food Science'],
 ARRAY['化学工程','计算机科学','建筑学','材料科学','食品科学'],
 '¥18,000 - 26,000/yr', '¥22,000 - 32,000/yr',
 'September (Fall), March (Spring)', '9月（秋季），3月（春季）',
 ARRAY['Engineering','Computer Science','Architecture','Materials Science'],
 'https://cdn.urongda.com//images/normal/medium/south-china-university-of-technology-logo-1024px.png',
 '#62 QS World 2025', 62,
 ARRAY['Bay Area Industry Hub','Materials Excellence','Engineering Heritage'],
 ARRAY['湾区产业枢纽','材料卓越','工科传统'],
 ARRAY['985','211','Double First Class'],
 ARRAY['985工程','211工程','双一流'],
 'SCUT has two main campuses — Wushan (central Guangzhou) and Guangzhou International Campus (Pazhou). International students are typically housed on the International Campus with self-contained room, air conditioning, private bathroom, and shared kitchens.',
 '华南理工大学有两个主要校区 — 五山校区（广州中心）和广州国际校区（琶洲）。国际学生通常入住国际校区，配备独立卫浴空调及共用厨房。',
 '¥1,200 - 2,400/yr', '¥1,200 - 2,400/年',
 ARRAY['Single Room','Shared Apartment'],
 ARRAY['单人间','合租公寓']),

('university-of-electronic-science-and-technology-of-china',
 'University of Electronic Science and Technology of China', '电子科技大学',
 'Chengdu', '成都', 28, 4.6, 'Public University', '公立大学',
 1956, '38,000+', '1,500+',
 'UESTC is a 985/211/DFC university in Chengdu with national-level leadership in electronics, communications, and information science. It originated from the radio engineering departments of several leading universities and contributed directly to the "Two Bombs, One Satellite" national program.',
 '电子科技大学是位于成都的 985/211/双一流高校，在电子、通信和信息科学领域处于国内领先水平。学校源于多所顶尖大学的无线电工程系，直接参与了"两弹一星"国家工程。',
 ARRAY['Electronic Engineering','Communications Engineering','Computer Science','Microelectronics','Information Security'],
 ARRAY['电子工程','通信工程','计算机科学','微电子','信息安全'],
 '¥16,000 - 24,000/yr', '¥20,000 - 30,000/yr',
 'September (Fall), March (Spring)', '9月（秋季），3月（春季）',
 ARRAY['Engineering','Computer Science','Information Security'],
 'https://cdn.urongda.com//images/normal/medium/university-of-electronic-science-and-technology-of-china-logo-1024px.png',
 '#321 QS World 2025', 321,
 ARRAY['Electronics Heritage','Communications Excellence','Two Bombs One Satellite Legacy'],
 ARRAY['电子传统','通信卓越','两弹一星传承'],
 ARRAY['985','211','Double First Class'],
 ARRAY['985工程','211工程','双一流'],
 'UESTC has two campuses — Shahe (main) and Qingcheng Mountain. International students are housed on the Shahe campus with furnished single rooms, air conditioning, and shared kitchens and laundry. Qingcheng campus offers a quieter setting for research students.',
 '电子科技大学有两个校区 — 沙河校区（主校区）和青城山校区。国际学生入住沙河校区，配备带家具单人间、空调及共用厨房和洗衣设施。青城校区为研究型学生提供更安静的环境。',
 '¥1,200 - 2,000/yr', '¥1,200 - 2,000/年',
 ARRAY['Single Room','Shared Apartment'],
 ARRAY['单人间','合租公寓']),

('harbin-institute-of-technology-shenzhen',
 'Harbin Institute of Technology, Shenzhen', '哈尔滨工业大学（深圳）',
 'Shenzhen', '深圳', 35, 4.7, 'Public University', '公立大学',
 2002, '7,500+', '600+',
 'HITSZ is a 985/211/DFC satellite campus of Harbin Institute of Technology, located in Shenzhen University Town. It offers the same engineering pedigree as the main campus with the added advantage of Shenzhen''s industry ecosystem — Huawei, Tencent, DJI, and BYD are within commuting distance.',
 '哈工大（深圳）是哈尔滨工业大学位于深圳大学城的 985/211/双一流分校区。继承本部工程教育传统，同时享有深圳产业生态优势 — 华为、腾讯、大疆、比亚迪均在通勤范围内。',
 ARRAY['Computer Science','Mechanical Engineering','Electrical Engineering','Materials Science','Automation'],
 ARRAY['计算机科学','机械工程','电气工程','材料科学','自动化'],
 '¥18,000 - 28,000/yr', '¥22,000 - 32,000/yr',
 'September (Fall), March (Spring)', '9月（秋季），3月（春季）',
 ARRAY['Engineering','Computer Science','Materials Science'],
 'https://cdn.urongda.com//images/normal/medium/harbin-institute-of-technology-shenzhen-logo-1024px.png',
 '#256 QS World 2025', 256,
 ARRAY['Shenzhen Location','HIT Engineering Pedigree','Industry Proximity'],
 ARRAY['深圳区位','哈工大工科传统','产业临近'],
 ARRAY['985','211','Double First Class'],
 ARRAY['985工程','211工程','双一流'],
 'HITSZ is located in Nanshan District within Shenzhen University Town. International students are housed in the dedicated international student residence hall — furnished rooms with private bathrooms, shared kitchens and study lounges on every floor.',
 '哈工大（深圳）位于南山区深圳大学城内。国际学生入住专门的国际学生公寓 — 带家具独立卫浴房间，每层共用厨房和自习室。',
 '¥1,800 - 3,200/yr', '¥1,800 - 3,200/年',
 ARRAY['Single Room','Studio Apartment'],
 ARRAY['单人间','一居室']),

('sichuan-university',
 'Sichuan University', '四川大学',
 'Chengdu', '成都', 22, 4.6, 'Public University', '公立大学',
 1896, '70,000+', '3,000+',
 'Sichuan University is a 985/211/DFC comprehensive university in Chengdu, formed from the merger of three older institutions. It is one of China''s largest by enrollment, with particular strength in medicine (the West China School of Medicine is among the country''s oldest and most respected), engineering, science, and humanities.',
 '四川大学是位于成都的 985/211/双一流综合性大学，由三所历史名校合并而成。学校是全国规模最大的高校之一，以医学（华西医学院历史悠久、享有盛誉）、工程、理科和人文著称。',
 ARRAY['Clinical Medicine','Engineering','Mathematics','Computer Science','Chemistry'],
 ARRAY['临床医学','工程','数学','计算机科学','化学'],
 '¥15,000 - 22,000/yr', '¥20,000 - 28,000/yr',
 'September (Fall), March (Spring)', '9月（秋季），3月（春季）',
 ARRAY['Medicine','Engineering','Science','Humanities'],
 'https://cdn.urongda.com//images/normal/medium/sichuan-university-logo-1024px.png',
 '#211 QS World 2025', 211,
 ARRAY['Comprehensive University','West China Medical Center','Chengdu Location'],
 ARRAY['综合性大学','华西医学中心','成都区位'],
 ARRAY['985','211','Double First Class'],
 ARRAY['985工程','211工程','双一流'],
 'Sichuan University has three main campuses — Wangjiang (humanities + sciences), Huaxi (medicine), and Jiang''an (engineering). International students are placed by school — medicine students at Huaxi with adjacent clinical teaching hospitals.',
 '四川大学有三个主要校区 — 望江校区（人文 + 理科）、华西校区（医学）、江安校区（工程）。国际学生按学院分配 — 医学生在华西校区，毗邻附属临床教学医院。',
 '¥1,000 - 2,000/yr', '¥1,000 - 2,000/年',
 ARRAY['Single Room','Shared Apartment'],
 ARRAY['单人间','合租公寓']),

('nanjing-university-of-aeronautics-and-astronautics',
 'Nanjing University of Aeronautics and Astronautics', '南京航空航天大学',
 'Nanjing', '南京', 50, 4.5, 'Public University', '公立大学',
 1952, '30,000+', '900+',
 'NUAA is a 211/DFC university specializing in aerospace, aviation, and mechanical engineering, one of the historic "Three Gorges of Aviation" (alongside BUAA and NUAU). It leads multiple national aerospace research programs and maintains deep ties with COMAC, AVIC, and the broader Chinese aerospace industry.',
 '南航是专注于航空航天和机械工程的 211/双一流高校，是中国航空"三大航"之一（与北航、沈飞并列）。学校牵头多项国家航空航天重点课题，与中国商飞、中航工业保持紧密合作。',
 ARRAY['Aerospace Engineering','Mechanical Engineering','Electrical Engineering','Materials Science','Automation'],
 ARRAY['航空航天工程','机械工程','电气工程','材料科学','自动化'],
 '¥16,000 - 24,000/yr', '¥20,000 - 28,000/yr',
 'September (Fall), March (Spring)', '9月（秋季），3月（春季）',
 ARRAY['Engineering','Aerospace','Materials Science'],
 'https://cdn.urongda.com//images/normal/medium/nanjing-university-of-aeronautics-and-astronautics-logo-1024px.png',
 '#581 QS World 2025', 581,
 ARRAY['Aerospace Specialization','Industry Connections','Engineering Focus'],
 ARRAY['航空航天特色','行业联系','工程导向'],
 ARRAY['211','Double First Class'],
 ARRAY['211工程','双一流'],
 'NUAA has two campuses — Ming Palace (main) and Jiangjun Road. International students are typically housed on the Jiangjun Road campus in dedicated international buildings with single occupancy, air conditioning, and shared kitchens.',
 '南京航空航天大学有两个校区 — 明故宫校区（主校区）和将军路校区。国际学生通常入住将军路校区专门的国际学生公寓，配单人间、空调及共用厨房。',
 '¥1,200 - 2,000/yr', '¥1,200 - 2,000/年',
 ARRAY['Single Room','Shared Apartment'],
 ARRAY['单人间','合租公寓'])
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, name_cn = EXCLUDED.name_cn,
  city = EXCLUDED.city, city_cn = EXCLUDED.city_cn,
  ranking = EXCLUDED.ranking, rating = EXCLUDED.rating,
  type = EXCLUDED.type, type_cn = EXCLUDED.type_cn,
  established = EXCLUDED.established, students = EXCLUDED.students,
  intl_students = EXCLUDED.intl_students,
  description = EXCLUDED.description, description_cn = EXCLUDED.description_cn,
  popular_programs = EXCLUDED.popular_programs,
  popular_programs_cn = EXCLUDED.popular_programs_cn,
  tuition_undergrad = EXCLUDED.tuition_undergrad,
  tuition_graduate = EXCLUDED.tuition_graduate,
  intake = EXCLUDED.intake, intake_cn = EXCLUDED.intake_cn,
  disciplines = EXCLUDED.disciplines, logo = EXCLUDED.logo,
  qs_ranking = EXCLUDED.qs_ranking, qs_world_ranking = EXCLUDED.qs_world_ranking,
  highlights_en = EXCLUDED.highlights_en, highlights_zh = EXCLUDED.highlights_zh,
  tags = EXCLUDED.tags, tags_cn = EXCLUDED.tags_cn,
  accommodation = EXCLUDED.accommodation,
  accommodation_cn = EXCLUDED.accommodation_cn,
  accommodation_cost = EXCLUDED.accommodation_cost,
  accommodation_cost_cn = EXCLUDED.accommodation_cost_cn,
  accommodation_types = EXCLUDED.accommodation_types,
  accommodation_types_cn = EXCLUDED.accommodation_types_cn;

-- ============================================
-- 2. Programs (15 rows: 3 per university)
-- ============================================

INSERT INTO public.programs (
  slug, name, name_cn, university_slug, degree, discipline, discipline_cn,
  language, duration, duration_cn, tuition, description, description_cn,
  requirements, requirements_cn, scholarship_available, intake, intake_cn
) VALUES
-- SCUT
('scut-bsc-chemical-engineering',
 'BSc in Chemical Engineering', '化学工程本科', 'south-china-university-of-technology',
 'bachelor', 'Engineering', '工程', 'English/Chinese', '4 years', '4年', '¥18,000 - 24,000/yr',
 'SCUT''s chemical engineering program is consistently ranked among China''s top 5, with strong industry placement in petrochemicals, materials, and energy sectors.',
 '华南理工大学化学工程专业长期位列全国前五，毕业生在石化、材料和能源行业具有强劲的产业资源。',
 ARRAY['High school diploma with chemistry + math','HSK 4 (Chinese-medium) or IELTS 6.0 (English-medium)'],
 ARRAY['高中毕业证含化学和数学','HSK 4（中文授课）或雅思 6.0（英文授课）'],
 true, 'September 2027', '2027 年 9 月'),
('scut-msc-computer-science',
 'MSc in Computer Science', '计算机科学硕士', 'south-china-university-of-technology',
 'master', 'Computer Science', '计算机科学', 'English', '2 years', '2年', '¥24,000 - 30,000/yr',
 'MSc Computer Science at SCUT covers AI, systems, and theory with research groups affiliated with the Greater Bay Area AI industry.',
 '华南理工大学计算机科学硕士涵盖人工智能、系统和理论方向，研究团队与大湾区人工智能产业深度对接。',
 ARRAY['Bachelor''s in CS or related','IELTS 6.5 or TOEFL 80','Research statement'],
 ARRAY['计算机或相关本科','雅思 6.5 或托福 80','研究计划'],
 true, 'September 2027', '2027 年 9 月'),
('scut-bsc-food-science',
 'BSc in Food Science and Engineering', '食品科学与工程本科', 'south-china-university-of-technology',
 'bachelor', 'Engineering', '工程', 'Chinese', '4 years', '4年', '¥16,000 - 22,000/yr',
 'SCUT''s food science program is widely considered China''s strongest, with alumni throughout the country''s food and beverage industry.',
 '华南理工大学食品科学专业被广泛认为国内最强，校友遍布全国食品饮料行业。',
 ARRAY['High school diploma with chemistry + biology','HSK 4'],
 ARRAY['高中毕业证含化学和生物','HSK 4'],
 true, 'September 2027', '2027 年 9 月'),

-- UESTC
('uestc-bsc-electronic-engineering',
 'BSc in Electronic Science and Technology', '电子科学与技术本科', 'university-of-electronic-science-and-technology-of-china',
 'bachelor', 'Engineering', '工程', 'English/Chinese', '4 years', '4年', '¥16,000 - 22,000/yr',
 'UESTC''s flagship electronic engineering program — the school''s foundation discipline and one of China''s strongest in microelectronics and RF.',
 '电子科技大学电子科学与技术是学校的奠基学科，也是国内最强的微电子与射频方向之一。',
 ARRAY['High school diploma with physics + math','HSK 4 (Chinese-medium) or IELTS 6.0 (English-medium)'],
 ARRAY['高中毕业证含物理和数学','HSK 4（中文授课）或雅思 6.0（英文授课）'],
 true, 'September 2027', '2027 年 9 月'),
('uestc-msc-communications-engineering',
 'MSc in Communications Engineering', '通信工程硕士', 'university-of-electronic-science-and-technology-of-china',
 'master', 'Engineering', '工程', 'English', '2.5 years', '2.5年', '¥22,000 - 30,000/yr',
 'MSc in Communications Engineering — wireless systems, 6G research, signal processing — with research ties to Huawei, ZTE, and the China Communications Standards Association.',
 '通信工程硕士 — 无线系统、6G 研究、信号处理 — 与华为、中兴、中国通信标准化协会保持研究合作。',
 ARRAY['Bachelor''s in EE, communications, or CS','IELTS 6.5'],
 ARRAY['电子工程、通信或计算机本科','雅思 6.5'],
 true, 'September 2027', '2027 年 9 月'),
('uestc-bsc-computer-science',
 'BSc in Computer Science', '计算机科学本科', 'university-of-electronic-science-and-technology-of-china',
 'bachelor', 'Computer Science', '计算机科学', 'English/Chinese', '4 years', '4年', '¥16,000 - 22,000/yr',
 'CS program with strong algorithms, AI, and systems curriculum — placement at major Chinese and multinational tech companies.',
 '计算机科学课程涵盖算法、人工智能和系统方向 — 毕业生进入国内外主要科技公司。',
 ARRAY['High school diploma with math','HSK 4 (Chinese-medium) or IELTS 6.0 (English-medium)'],
 ARRAY['高中毕业证含数学','HSK 4（中文授课）或雅思 6.0（英文授课）'],
 true, 'September 2027', '2027 年 9 月'),

-- HITSZ
('hitsz-msc-computer-science',
 'MSc in Computer Science', '计算机科学硕士', 'harbin-institute-of-technology-shenzhen',
 'master', 'Computer Science', '计算机科学', 'English', '2 years', '2年', '¥24,000 - 30,000/yr',
 'HITSZ MSc CS with research groups in AI, robotics, and computer vision — direct industry partnerships given the Shenzhen location.',
 '哈工大（深圳）计算机科学硕士涵盖人工智能、机器人和计算机视觉 — 凭借深圳区位拥有直接的产业合作。',
 ARRAY['Bachelor''s in CS or related','IELTS 6.5','Research statement'],
 ARRAY['计算机或相关本科','雅思 6.5','研究计划'],
 true, 'September 2027', '2027 年 9 月'),
('hitsz-bsc-mechanical-engineering',
 'BSc in Mechanical Engineering', '机械工程本科', 'harbin-institute-of-technology-shenzhen',
 'bachelor', 'Engineering', '工程', 'Chinese', '4 years', '4年', '¥18,000 - 24,000/yr',
 'Mechanical Engineering at HITSZ carries HIT''s century-old engineering tradition, with access to Shenzhen''s advanced manufacturing ecosystem.',
 '哈工大（深圳）机械工程继承哈工大百年工科传统，可直接对接深圳先进制造产业链。',
 ARRAY['High school diploma with physics + math','HSK 4'],
 ARRAY['高中毕业证含物理和数学','HSK 4'],
 true, 'September 2027', '2027 年 9 月'),
('hitsz-bsc-electrical-engineering',
 'BSc in Electrical Engineering', '电气工程本科', 'harbin-institute-of-technology-shenzhen',
 'bachelor', 'Engineering', '工程', 'Chinese/English', '4 years', '4年', '¥18,000 - 24,000/yr',
 'EE program with specializations in power systems, renewable energy, and smart grid — Shenzhen''s tech ecosystem provides exceptional industry access.',
 '电气工程本科涵盖电力系统、可再生能源和智能电网 — 深圳科技生态提供卓越的产业接触。',
 ARRAY['High school diploma with physics + math','HSK 4 (Chinese-medium) or IELTS 6.0 (English-medium)'],
 ARRAY['高中毕业证含物理和数学','HSK 4（中文授课）或雅思 6.0（英文授课）'],
 true, 'September 2027', '2027 年 9 月'),

-- Sichuan University
('sichuan-bsc-clinical-medicine',
 'BSc in Clinical Medicine (MBBS-equivalent)', '临床医学本科', 'sichuan-university',
 'bachelor', 'Medicine', '医学', 'English/Chinese', '6 years', '6年', '¥22,000 - 32,000/yr',
 'Sichuan University''s West China School of Medicine is among China''s oldest and most respected medical schools — direct hospital rotations at West China Hospital.',
 '四川大学华西医学院是中国历史最悠久、最受尊敬的医学院之一 — 在华西医院直接进行临床轮转。',
 ARRAY['High school diploma with biology + chemistry','HSK 4 (Chinese-medium) or IELTS 6.5 (English-medium)','Strong math + science grades'],
 ARRAY['高中毕业证含生物和化学','HSK 4（中文授课）或雅思 6.5（英文授课）','理综成绩突出'],
 false, 'September 2027', '2027 年 9 月'),
('sichuan-msc-computer-science',
 'MSc in Computer Science', '计算机科学硕士', 'sichuan-university',
 'master', 'Computer Science', '计算机科学', 'English', '3 years', '3年', '¥22,000 - 28,000/yr',
 'MSc CS with research groups in AI, big data, and software engineering — located in Chengdu''s growing tech sector.',
 '计算机科学硕士涵盖人工智能、大数据和软件工程 — 位于成都快速发展的科技行业。',
 ARRAY['Bachelor''s in CS or related','IELTS 6.5'],
 ARRAY['计算机或相关本科','雅思 6.5'],
 true, 'September 2027', '2027 年 9 月'),
('sichuan-bsc-engineering',
 'BSc in Engineering (Mechanical / Civil / Chemical)', '工程本科（机械/土木/化工）', 'sichuan-university',
 'bachelor', 'Engineering', '工程', 'Chinese', '4 years', '4年', '¥15,000 - 20,000/yr',
 'Engineering undergraduate programs with strong theoretical foundation and Sichuan-province industry placement.',
 '工程本科项目理论功底深厚，毕业生在四川省产业内就业有保障。',
 ARRAY['High school diploma with physics + math','HSK 4'],
 ARRAY['高中毕业证含物理和数学','HSK 4'],
 true, 'September 2027', '2027 年 9 月'),

-- NUAA
('nuaa-bsc-aerospace-engineering',
 'BSc in Aerospace Engineering', '航空航天工程本科', 'nanjing-university-of-aeronautics-and-astronautics',
 'bachelor', 'Engineering', '工程', 'Chinese/English', '4 years', '4年', '¥16,000 - 24,000/yr',
 'NUAA''s flagship aerospace program — direct industry ties with COMAC, AVIC, and the China Academy of Space Technology.',
 '南航航空航天旗舰专业 — 与中国商飞、中航工业、中国空间技术研究院有直接产业合作。',
 ARRAY['High school diploma with physics + math','HSK 4 (Chinese-medium) or IELTS 6.0 (English-medium)'],
 ARRAY['高中毕业证含物理和数学','HSK 4（中文授课）或雅思 6.0（英文授课）'],
 true, 'September 2027', '2027 年 9 月'),
('nuaa-msc-mechanical-engineering',
 'MSc in Mechanical Engineering', '机械工程硕士', 'nanjing-university-of-aeronautics-and-astronautics',
 'master', 'Engineering', '工程', 'English', '2.5 years', '2.5年', '¥22,000 - 28,000/yr',
 'MSc Mechanical Engineering with specializations in robotics, advanced manufacturing, and aerospace systems.',
 '机械工程硕士涵盖机器人、先进制造和航空航天系统方向。',
 ARRAY['Bachelor''s in ME, aerospace, or related','IELTS 6.5'],
 ARRAY['机械、航空航天或相关本科','雅思 6.5'],
 true, 'September 2027', '2027 年 9 月'),
('nuaa-bsc-materials-science',
 'BSc in Materials Science and Engineering', '材料科学与工程本科', 'nanjing-university-of-aeronautics-and-astronautics',
 'bachelor', 'Engineering', '工程', 'Chinese', '4 years', '4年', '¥16,000 - 22,000/yr',
 'Materials Science with aerospace focus — composites, structural materials, and additive manufacturing for aviation.',
 '材料科学聚焦航空航天 — 复合材料、结构材料及航空增材制造。',
 ARRAY['High school diploma with physics + chemistry','HSK 4'],
 ARRAY['高中毕业证含物理和化学','HSK 4'],
 true, 'September 2027', '2027 年 9 月')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, name_cn = EXCLUDED.name_cn,
  university_slug = EXCLUDED.university_slug, degree = EXCLUDED.degree,
  discipline = EXCLUDED.discipline, discipline_cn = EXCLUDED.discipline_cn,
  language = EXCLUDED.language, duration = EXCLUDED.duration,
  duration_cn = EXCLUDED.duration_cn, tuition = EXCLUDED.tuition,
  description = EXCLUDED.description, description_cn = EXCLUDED.description_cn,
  requirements = EXCLUDED.requirements, requirements_cn = EXCLUDED.requirements_cn,
  scholarship_available = EXCLUDED.scholarship_available,
  intake = EXCLUDED.intake, intake_cn = EXCLUDED.intake_cn;

-- ============================================
-- 3. Scholarships (5 rows: 1 per university)
-- ============================================

INSERT INTO public.scholarships (
  slug, name, name_cn, type, degree_levels, eligible_regions, duration,
  description, description_cn, coverage, coverage_cn, requirements, requirements_cn,
  deadline
) VALUES
('scut-international-student-scholarship',
 'SCUT International Student Scholarship', '华南理工大学国际学生奖学金',
 'university',
 ARRAY['bachelor','master'],
 'All international students', '1-4 years (renewable)',
 'SCUT''s flagship scholarship for international students with strong academic record. Covers partial to full tuition plus a monthly living stipend.',
 '华南理工大学面向学术成绩优异的国际学生的旗舰奖学金。覆盖部分至全部学费及月度生活补贴。',
 ARRAY['Tuition waiver (full or partial)','Monthly stipend ¥1,500 - 3,000'],
 ARRAY['学费减免（全额或部分）','月度补贴 ¥1,500 - 3,000'],
 ARRAY['Top 20% in high school / bachelor''s','HSK 4 or IELTS 6.0+','Extracurricular + leadership record'],
 ARRAY['高中或本科前 20% 成绩','HSK 4 或雅思 6.0 以上','课外活动及领导力记录'],
 'May 31, 2027'),

('uestc-excellence-scholarship',
 'UESTC Excellence Scholarship', '电子科技大学卓越奖学金',
 'university',
 ARRAY['bachelor','master','phd'],
 'All international students', '1-4 years (renewable)',
 'UESTC''s top scholarship — partial to full tuition waiver plus a competitive monthly stipend for outstanding applicants.',
 '电子科技大学顶级奖学金 — 面向杰出申请者，覆盖部分至全部学费及具有竞争力的月度补贴。',
 ARRAY['Tuition waiver (full or partial)','Monthly stipend ¥1,500 - 3,500'],
 ARRAY['学费减免（全额或部分）','月度补贴 ¥1,500 - 3,500'],
 ARRAY['Top 15% in previous degree','HSK 4 or IELTS 6.5+','Strong STEM background'],
 ARRAY['前一学位前 15% 成绩','HSK 4 或雅思 6.5 以上','理工科背景'],
 'May 31, 2027'),

('hitsz-innovation-scholarship',
 'HITSZ Innovation Scholarship', '哈工大（深圳）创新奖学金',
 'university',
 ARRAY['master','phd'],
 'All international students', '1-3 years (renewable)',
 'Targeted at graduate students with strong research backgrounds — covers full tuition and a competitive monthly stipend with priority for Shenzhen-based industry research projects.',
 '面向具有强大研究背景的研究生 — 覆盖全额学费及具有竞争力的月度补贴，深圳本地产业研究项目优先。',
 ARRAY['Full tuition waiver','Monthly stipend ¥3,000 - 5,000','Research funding available'],
 ARRAY['全额学费减免','月度补贴 ¥3,000 - 5,000','可申请研究经费'],
 ARRAY['Master''s GPA 3.5+ / Bachelor''s GPA 3.7+','IELTS 6.5 or TOEFL 90','Published research preferred'],
 ARRAY['硕士 GPA 3.5 以上 / 本科 GPA 3.7 以上','雅思 6.5 或托福 90','有发表研究优先'],
 'May 31, 2027'),

('sichuan-university-presidents-scholarship',
 'Sichuan University President''s Scholarship', '四川大学校长奖学金',
 'university',
 ARRAY['bachelor','master','phd'],
 'All international students', '1-4 years (renewable)',
 'Sichuan University''s most prestigious international student scholarship — full tuition, accommodation, and monthly stipend.',
 '四川大学最具声望的国际学生奖学金 — 全额学费、住宿及月度补贴。',
 ARRAY['Full tuition waiver','Accommodation provided','Monthly stipend ¥2,500 - 4,000'],
 ARRAY['全额学费减免','提供住宿','月度补贴 ¥2,500 - 4,000'],
 ARRAY['Top 10% in previous degree','HSK 5 or IELTS 6.5+','Strong leadership + service record'],
 ARRAY['前一学位前 10% 成绩','HSK 5 或雅思 6.5 以上','领导力和社会服务记录'],
 'April 30, 2027'),

('nuaa-aviation-scholarship',
 'NUAA Aviation Scholarship', '南京航空航天大学航空奖学金',
 'university',
 ARRAY['bachelor','master','phd'],
 'All international students', '1-4 years (renewable)',
 'NUAA''s flagship scholarship for students entering aerospace, aviation, or mechanical engineering programs. Covers partial to full tuition plus monthly stipend.',
 '南航面向航空航天、机械工程专业学生的旗舰奖学金。覆盖部分至全部学费及月度补贴。',
 ARRAY['Tuition waiver (full or partial)','Monthly stipend ¥1,800 - 3,500'],
 ARRAY['学费减免（全额或部分）','月度补贴 ¥1,800 - 3,500'],
 ARRAY['Strong physics + math background','HSK 4 or IELTS 6.0+','Aerospace / aviation interest'],
 ARRAY['物理和数学背景突出','HSK 4 或雅思 6.0 以上','航空航天兴趣'],
 'May 31, 2027')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, name_cn = EXCLUDED.name_cn,
  type = EXCLUDED.type, degree_levels = EXCLUDED.degree_levels,
  eligible_regions = EXCLUDED.eligible_regions, duration = EXCLUDED.duration,
  description = EXCLUDED.description, description_cn = EXCLUDED.description_cn,
  coverage = EXCLUDED.coverage, coverage_cn = EXCLUDED.coverage_cn,
  requirements = EXCLUDED.requirements, requirements_cn = EXCLUDED.requirements_cn,
  deadline = EXCLUDED.deadline;

-- ============================================
-- 4. Active webinar session (20 October 2026)
-- ============================================

-- Flip any currently-active session to inactive first so the
-- partial unique index `idx_webinar_sessions_single_active`
-- doesn't 23505 our UPSERT.
UPDATE public.webinar_sessions
  SET is_active = false
  WHERE is_active = true
    AND slug <> 'webinar-2027-intake-csc';

INSERT INTO public.webinar_sessions (
  slug, title_en, title_zh,
  description_en, description_zh,
  session_date, session_time, duration_minutes,
  join_url, status, is_active, display_order
) VALUES (
  'webinar-2027-intake-csc',
  'Engineering + Computer Science Universities Spotlight — Tue 20 October 2026',
  '工程与计算机科学大学专题讲座 — 2026 年 10 月 20 日（周二）',
  'Live spotlight on five top engineering and computer-science universities for the September 2027 intake: SCUT, UESTC, HITSZ, Sichuan University, and NUAA. Programs, scholarships, best time to apply, and admissions requirements covered for each school.',
  '2027 年 9 月入学的五所顶尖工程与计算机科学大学专题：华南理工、电子科大、哈工大（深圳）、四川大学、南京航空航天大学。逐一介绍各校项目、奖学金、最佳申请时机与录取要求。',
  '2026-10-20 14:00:00+08'::timestamptz,
  '10:00 AM Beijing Time',
  60,
  NULL,                         -- admin pastes the live link via SessionEditDialog
  'Scheduled',
  true,
  0
)
ON CONFLICT (slug) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  title_zh = EXCLUDED.title_zh,
  description_en = EXCLUDED.description_en,
  description_zh = EXCLUDED.description_zh,
  session_date = EXCLUDED.session_date,
  session_time = EXCLUDED.session_time,
  duration_minutes = EXCLUDED.duration_minutes,
  is_active = EXCLUDED.is_active;

-- ============================================
-- 5. Webinar topics (20 rows: 4 per university, one per kind)
-- ============================================
--
-- Four separate INSERTs (one per `kind`) instead of one giant
-- cross-join — keeps every VALUES tuple's column count
-- consistent (Postgres rejects mixed-length tuples in a single
-- VALUES clause) and makes each kind's intent obvious in diff.
-- All four pull the active session + the 5 university rows via
-- subqueries on slug, so no UUID round-tripping is needed.

-- 5a. kind = 'program'
INSERT INTO public.webinar_topics (
  session_id, university_id, kind, intake, degree,
  title_en, title_zh, body_en, body_zh, display_order
)
SELECT
  (SELECT id FROM public.webinar_sessions WHERE is_active = true LIMIT 1),
  u.id,
  'program', NULL, NULL,
  'Programs available', '开设项目',
  k.body_en, k.body_zh,
  0
FROM public.universities u
JOIN (VALUES
  ('south-china-university-of-technology',
   'SCUT offers three flagship programs for the September 2027 intake: BSc Chemical Engineering, MSc Computer Science, and BSc Food Science and Engineering. All are tuition-accessible to international students (¥16-30k/year) and all accept CSC, SCUT International Student Scholarship, and provincial government funding.',
   '华南理工大学 2027 年 9 月入学有三个旗舰项目：化学工程本科、计算机科学硕士、食品科学与工程本科。所有项目对国际学生学费友好（¥16,000-30,000/年），均可申请 CSC、华南理工大学国际学生奖学金及省级政府资助。'),
  ('university-of-electronic-science-and-technology-of-china',
   'UESTC offers three flagship programs for the September 2027 intake: BSc Electronic Science and Technology (the school''s foundation discipline), MSc Communications Engineering, and BSc Computer Science. All English-medium options available. Tuition: ¥16-30k/year.',
   '电子科技大学 2027 年 9 月入学有三个旗舰项目：电子科学与技术本科（学校奠基学科）、通信工程硕士、计算机科学本科。均提供英文授课选项。学费：¥16,000-30,000/年。'),
  ('harbin-institute-of-technology-shenzhen',
   'HITSZ offers three flagship programs for September 2027: MSc Computer Science, BSc Mechanical Engineering, and BSc Electrical Engineering. All programs benefit from the Shenzhen location — direct industry partnerships with Huawei, Tencent, DJI, and BYD. Tuition: ¥18-32k/year.',
   '哈工大（深圳）2027 年 9 月入学有三个旗舰项目：计算机科学硕士、机械工程本科、电气工程本科。所有项目得益于深圳区位 — 与华为、腾讯、大疆、比亚迪有直接产业合作。学费：¥18,000-32,000/年。'),
  ('sichuan-university',
   'Sichuan University offers three flagship programs for September 2027: BSc Clinical Medicine (6-year MBBS-equivalent, English-medium available), MSc Computer Science, and BSc Engineering (mechanical / civil / chemical). Note: BSc Clinical Medicine is NOT scholarship_available. Tuition: ¥15-32k/year.',
   '四川大学 2027 年 9 月入学有三个旗舰项目：临床医学本科（6 年制 MBBS 等效，可英文授课）、计算机科学硕士、工程本科（机械/土木/化工）。注意：临床医学本科不支持奖学金。学费：¥15,000-32,000/年。'),
  ('nanjing-university-of-aeronautics-and-astronautics',
   'NUAA offers three flagship programs for September 2027: BSc Aerospace Engineering (the school''s flagship), MSc Mechanical Engineering, and BSc Materials Science and Engineering. Direct industry ties with COMAC, AVIC, and China Academy of Space Technology. Tuition: ¥16-28k/year.',
   '南京航空航天大学 2027 年 9 月入学有三个旗舰项目：航空航天工程本科（学校旗舰专业）、机械工程硕士、材料科学与工程本科。与中国商飞、中航工业、中国空间技术研究院有直接产业合作。学费：¥16,000-28,000/年。')
) AS k(slug, body_en, body_zh) ON u.slug = k.slug;

-- 5b. kind = 'scholarship'
INSERT INTO public.webinar_topics (
  session_id, university_id, kind, intake, degree,
  title_en, title_zh, body_en, body_zh, display_order
)
SELECT
  (SELECT id FROM public.webinar_sessions WHERE is_active = true LIMIT 1),
  u.id,
  'scholarship', NULL, NULL,
  'Scholarships', '奖学金',
  k.body_en, k.body_zh,
  1
FROM public.universities u
JOIN (VALUES
  ('south-china-university-of-technology',
   'The SCUT International Student Scholarship covers full or partial tuition plus ¥1,500–3,000/month living stipend. CSC and Guangzhou Government scholarships are also available. Most programs are scholarship_available=True. Apply by May 31, 2027 for the September 2027 intake.',
   '华南理工大学国际学生奖学金覆盖全额或部分学费，外加 ¥1,500-3,000/月生活补贴。CSC 和广州市政府奖学金也可申请。大多数项目支持奖学金。2027 年 9 月入学申请截止日为 2027 年 5 月 31 日。'),
  ('university-of-electronic-science-and-technology-of-china',
   'UESTC Excellence Scholarship covers full or partial tuition plus ¥1,500–3,500/month. CSC and Sichuan Provincial scholarships also accepted. Most programs scholarship_available=True. Apply by May 31, 2027 for September 2027 intake.',
   '电子科技大学卓越奖学金覆盖全额或部分学费，外加 ¥1,500-3,500/月。CSC 和 SG 省奖学金也可申请。大多数项目支持奖学金。2027 年 9 月入学申请截止日为 2027 年 5 月 31 日。'),
  ('harbin-institute-of-technology-shenzhen',
   'HITSZ Innovation Scholarship covers full tuition plus ¥3,000–5,000/month with research funding — aimed at graduate students with research orientation. CSC and Shenzhen Government scholarships also accepted. Apply by May 31, 2027.',
   '哈工大（深圳）创新奖学金覆盖全额学费及 ¥3,000-5,000/月，另提供研究经费 — 面向有研究背景的研究生。CSC 和深圳市政府奖学金也可申请。截止日为 2027 年 5 月 31 日。'),
  ('sichuan-university',
   'Sichuan University President''s Scholarship is the school''s most prestigious — full tuition, accommodation, plus ¥2,500–4,000/month stipend. CSC and Sichuan Provincial scholarships also accepted. Deadline: April 30, 2027 — earlier than most.',
   '四川大学校长奖学金是学校最具声望的奖项 — 全额学费、住宿，外加 ¥2,500-4,000/月补贴。CSC 和 SG 省奖学金也可申请。截止日为 2027 年 4 月 30 日 — 比多数学校更早。'),
  ('nanjing-university-of-aeronautics-and-astronautics',
   'NUAA Aviation Scholarship covers full or partial tuition plus ¥1,800–3,500/month. CSC and Jiangsu Provincial scholarships also accepted. NUAA is 211 + DFC (NOT 985). Apply by May 31, 2027.',
   '南京航空航天大学航空奖学金覆盖全额或部分学费，外加 ¥1,800-3,500/月。CSC 和江苏省奖学金也可申请。南航是 211 + 双一流（不是 985）。截止日为 2027 年 5 月 31 日。')
) AS k(slug, body_en, body_zh) ON u.slug = k.slug;

-- 5c. kind = 'timing'
INSERT INTO public.webinar_topics (
  session_id, university_id, kind, intake, degree,
  title_en, title_zh, body_en, body_zh, display_order
)
SELECT
  (SELECT id FROM public.webinar_sessions WHERE is_active = true LIMIT 1),
  u.id,
  'timing', NULL, NULL,
  'Best time to apply', '最佳申请时机',
  k.body_en, k.body_zh,
  2
FROM public.universities u
JOIN (VALUES
  ('south-china-university-of-technology',
   'Apply by May 2027 for the September 2027 intake. The school has two application rounds: the first closes in February (preferred for scholarship consideration) and the second in May. CSC applications close in early April — international students targeting CSC must apply to the university simultaneously with the CSC portal.',
   '2027 年 5 月前申请 2027 年 9 月入学。学校分两轮申请：第一轮 2 月截止（奖学金优先考虑），第二轮 5 月截止。CSC 申请 4 月初截止 — 国际学生需通过 CSC 平台和学校同时申请。'),
  ('university-of-electronic-science-and-technology-of-china',
   'Apply by April 2027 for September 2027 intake. UESTC has rolling admissions for international students — earlier applications get priority for scholarship consideration. CSC applications close in early April — coordinate timing carefully.',
   '2027 年 4 月前申请 2027 年 9 月入学。电子科技大学对国际学生采取滚动录取方式，越早申请越优先考虑奖学金。CSC 申请 4 月初截止 — 需仔细协调时间。'),
  ('harbin-institute-of-technology-shenzhen',
   'Apply by March 2027 for September 2027 intake. HITSZ scholarship consideration is most competitive for early submissions. CSC coordination is critical — both CSC portal and HITSZ must be applied to in the same calendar month.',
   '2027 年 3 月前申请 2027 年 9 月入学。哈工大（深圳）奖学金竞争激烈，越早提交越好。CSC 协调至关重要 — 需在同月同时申请 CSC 平台和哈工大（深圳）。'),
  ('sichuan-university',
   'Apply by February 2027 for September 2027 intake. The President''s Scholarship deadline (April 30) is the binding constraint. Medicine applicants should apply even earlier — clinical placement slots fill by March.',
   '2027 年 2 月前申请 2027 年 9 月入学。校长奖学金截止日（4 月 30 日）是硬性约束。医学专业申请者应更早申请 — 临床实习名额 3 月前填满。'),
  ('nanjing-university-of-aeronautics-and-astronautics',
   'Apply by April 2027 for September 2027 intake. NUAA rolls admissions but aerospace programs fill by then — earlier is better. CSC coordination is critical — apply to CSC portal and NUAA simultaneously.',
   '2027 年 4 月前申请 2027 年 9 月入学。南航采取滚动录取，但航空航天项目通常 4 月前满额 — 越早越好。CSC 协调至关重要 — 需同时申请 CSC 平台和南航。')
) AS k(slug, body_en, body_zh) ON u.slug = k.slug;

-- 5d. kind = 'requirement'
INSERT INTO public.webinar_topics (
  session_id, university_id, kind, intake, degree,
  title_en, title_zh, body_en, body_zh, display_order
)
SELECT
  (SELECT id FROM public.webinar_sessions WHERE is_active = true LIMIT 1),
  u.id,
  'requirement', NULL, NULL,
  'Admission requirements', '录取要求',
  k.body_en, k.body_zh,
  3
FROM public.universities u
JOIN (VALUES
  ('south-china-university-of-technology',
   'Bachelor''s: high school diploma with chemistry + math, HSK 4 (Chinese-medium) or IELTS 6.0 (English-medium). Master''s: bachelor''s in CS or related, IELTS 6.5 or TOEFL 80, research statement required for research degrees.',
   '本科：高中毕业证含化学和数学，HSK 4（中文授课）或雅思 6.0（英文授课）。硕士：计算机或相关本科，雅思 6.5 或托福 80，研究型项目需研究计划。'),
  ('university-of-electronic-science-and-technology-of-china',
   'Bachelor''s: high school diploma with physics + math, HSK 4 (Chinese-medium) or IELTS 6.0 (English-medium). Master''s: bachelor''s in EE, communications, or CS, IELTS 6.5, research statement required for research degrees.',
   '本科：高中毕业证含物理和数学，HSK 4（中文授课）或雅思 6.0（英文授课）。硕士：电子工程、通信或计算机本科，雅思 6.5，研究型项目需研究计划。'),
  ('harbin-institute-of-technology-shenzhen',
   'Master''s: bachelor''s in CS or related, IELTS 6.5 or TOEFL 80, research statement, published research preferred. Bachelor''s: high school diploma with physics + math, HSK 4 (Chinese-medium) or IELTS 6.0 (English-medium).',
   '硕士：计算机或相关本科，雅思 6.5 或托福 80，研究计划，有发表研究优先。本科：高中毕业证含物理和数学，HSK 4（中文授课）或雅思 6.0（英文授课）。'),
  ('sichuan-university',
   'Medicine (Bachelor''s): high school diploma with biology + chemistry, HSK 4 or IELTS 6.5 (English-medium), strong math + science grades. Master''s CS: bachelor''s in CS, IELTS 6.5. Engineering bachelor''s: physics + math, HSK 4.',
   '医学（本科）：高中毕业证含生物和化学，HSK 4 或雅思 6.5（英文授课），理综成绩突出。计算机硕士：计算机本科，雅思 6.5。工程本科：物理和数学，HSK 4。'),
  ('nanjing-university-of-aeronautics-and-astronautics',
   'Aerospace / Materials bachelor''s: high school diploma with physics + chemistry (Materials) or physics + math (Aerospace), HSK 4 (Chinese-medium) or IELTS 6.0 (English-medium). ME master''s: bachelor''s in ME, aerospace, or related, IELTS 6.5.',
   '航空航天/材料本科：高中毕业证含物理和化学（材料）或物理和数学（航空航天），HSK 4（中文授课）或雅思 6.0（英文授课）。机械硕士：机械、航空航天等本科，雅思 6.5。')
) AS k(slug, body_en, body_zh) ON u.slug = k.slug;

-- ============================================
-- Sanity probes (migration fails loudly if any seed row is missing)
-- ============================================

DO $$
DECLARE
  uni_count int;
  prog_count int;
  schol_count int;
  topic_count int;
  active_session_id uuid;
  active_session_slug text;
BEGIN
  SELECT COUNT(*) INTO uni_count FROM public.universities
    WHERE slug IN (
      'south-china-university-of-technology',
      'university-of-electronic-science-and-technology-of-china',
      'harbin-institute-of-technology-shenzhen',
      'sichuan-university',
      'nanjing-university-of-aeronautics-and-astronautics'
    );
  IF uni_count <> 5 THEN
    RAISE EXCEPTION 'expected 5 universities seeded, got %', uni_count;
  END IF;

  SELECT COUNT(*) INTO prog_count FROM public.programs
    WHERE slug LIKE 'scut-%' OR slug LIKE 'uestc-%' OR slug LIKE 'hitsz-%'
       OR slug LIKE 'sichuan-%' OR slug LIKE 'nuaa-%';
  IF prog_count < 15 THEN
    RAISE EXCEPTION 'expected at least 15 programs, got %', prog_count;
  END IF;

  SELECT COUNT(*) INTO schol_count FROM public.scholarships
    WHERE slug IN (
      'scut-international-student-scholarship',
      'uestc-excellence-scholarship',
      'hitsz-innovation-scholarship',
      'sichuan-university-presidents-scholarship',
      'nuaa-aviation-scholarship'
    );
  IF schol_count <> 5 THEN
    RAISE EXCEPTION 'expected 5 scholarships, got %', schol_count;
  END IF;

  SELECT id, slug INTO active_session_id, active_session_slug
    FROM public.webinar_sessions
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT 1;
  IF active_session_slug IS NULL OR active_session_slug <> 'webinar-2027-intake-csc' THEN
    RAISE EXCEPTION 'expected active session = webinar-2027-intake-csc, got %', active_session_slug;
  END IF;

  SELECT COUNT(*) INTO topic_count FROM public.webinar_topics
    WHERE session_id = active_session_id
      AND kind IN ('program','scholarship','timing','requirement')
      AND university_id IS NOT NULL;
  IF topic_count < 20 THEN
    RAISE EXCEPTION 'expected at least 20 university-kind topics, got %', topic_count;
  END IF;
END $$;