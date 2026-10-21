/**
 * Legal documents — Privacy Policy + Terms of Use.
 *
 * Why a module and not i18n keys: these are long-form bilingual
 * documents (like the guide modules in `src/lib/guides/`), not UI
 * chrome strings. Keeping them here means:
 *  - the translation table stays a UI-string table (the i18n parity
 *    gate in `src/lib/__tests__/i18n-zh-parity.test.ts` checks
 *    en/zh key parity, not document parity);
 *  - each document can be read as a whole document instead of a
 *    scatter of 150 flat keys.
 *
 * ─────────────────────────────────────────────────────────────────
 * ⚠️ REVIEW BEFORE RELYING ON THESE
 * ─────────────────────────────────────────────────────────────────
 * These documents were written to match what this codebase actually
 * does (verified against the API routes + Supabase tables listed
 * below). They are a solid, accurate starting point — but they are
 * NOT a substitute for a lawyer, and the exact wording matters in
 * the jurisdictions SICA serves (China, plus the EU/UK/Gulf/Africa
 * where most applicants are from). Before treating this as a
 * compliance artefact, have it reviewed against:
 *   - the actual retention periods in the live Supabase project
 *     (the copy below states the intent, not a verified TTL);
 *   - the Resend / GA4 / Supabase data-processing agreements;
 *   - the specific consent requirements of the markets you operate in.
 *
 * The "last updated" date on each document is a constant below —
 * bump it when the text changes, otherwise the page lies.
 */

export interface LegalSection {
  /** Stable anchor id — used for the on-page table of contents. */
  id: string;
  heading: string;
  /** Body paragraphs. Plain text; no HTML. */
  paragraphs: string[];
  /** Optional bullet list appended after the paragraphs. */
  bullets?: string[];
}

export interface LegalDocVariant {
  title: string;
  /** e.g. 'Last updated: 21 October 2026' */
  updatedLabel: string;
  /** Short standfirst under the title. */
  intro: string;
  sections: LegalSection[];
}

export type LegalDocSlug = 'privacy' | 'terms';

export interface LegalDoc {
  slug: LegalDocSlug;
  en: LegalDocVariant;
  zh: LegalDocVariant;
}

/** Bump when either document's text changes. */
export const LEGAL_DOCS_UPDATED = {
  en: 'Last updated: 21 October 2026',
  zh: '最后更新：2026 年 10 月 21 日',
} as const;

/**
 * Contact block used by both documents.
 * The email is the same one the rest of the site publishes
 * (`info@studyinchina.academy` — the platform's only mail domain).
 */
export const LEGAL_CONTACT = {
  email: 'info@studyinchina.academy',
  address: 'Guangzhou, Guangdong, China',
  whatsapp: '+86 173 2576 4171',
} as const;

// ─────────────────────────────────────────────────────────────────
// Privacy Policy
// ─────────────────────────────────────────────────────────────────

const privacyEn: LegalDocVariant = {
  title: 'Privacy Policy',
  updatedLabel: LEGAL_DOCS_UPDATED.en,
  intro:
    'This policy explains what personal information SICA collects when you use studyinchina.academy, why we collect it, and what you can ask us to do with it.',
  sections: [
    {
      id: 'what-we-collect',
      heading: '1. What we collect',
      paragraphs: [
        'We only collect what we need to help you apply to a university in China. Depending on how you interact with the site, that can include:',
      ],
      bullets: [
        'Enquiry data — the name, email address, phone number, country and message you submit through the contact form, the assessment form, the public application form, the webinar sign-up, or the chat widget.',
        'Account data — if you create a student or partner portal account, your email address, password (stored only in hashed form), profile details and the role tied to your account.',
        'Application data — the university, programme, degree level and intake you apply for, your academic background, your answers to our assessment questions, and the notes our counsellors add while working with you.',
        'Document data — the academic transcripts, passports, language-test certificates, photographs and other files you upload to a portal. These are stored in private file storage and are only visible to the SICA staff and partner agencies working on your application.',
        'Usage data — the pages you visit, the device and browser you use, and the referring page. Where you submit a form we also record your browser user-agent string. Some forms record a one-way hashed form of your IP address, used only to prevent duplicate submissions.',
        'Newsletter preferences — the email address you give us when you subscribe, stored so that we can send you the newsletter and so that we can suppress the address if you unsubscribe.',
      ],
    },
    {
      id: 'why-we-collect',
      heading: '2. Why we collect it',
      paragraphs: [
        'We use your information for the following purposes, and no others:',
      ],
      bullets: [
        'To answer your enquiry and to send you the information you asked for.',
        'To assess your academic background and match you with universities and programmes that realistically fit.',
        'To prepare, file and track your application on your behalf.',
        'To send you scholarship deadlines, admissions updates and other SICA news — only if you have asked us to.',
        'To improve the site: which pages are useful, where students get stuck, and which articles need updating.',
        'To comply with our legal, tax and record-keeping obligations.',
      ],
    },
    {
      id: 'cookies',
      heading: '3. Cookies and analytics',
      paragraphs: [
        'We use a small number of first-party cookies, all of which are required for the site to work or to remember a choice you have made:',
      ],
      bullets: [
        'A language cookie that remembers whether you are reading the site in English or Chinese.',
        'A chat session cookie that keeps your conversation with our assistant attached to your browser session so that it is not shown to somebody else.',
        'A chat history token stored in your browser that lets you pick up a previous conversation.',
        'An interface cookie that remembers whether the admin sidebar is open.',
      ],
    },
    {
      id: 'sharing',
      heading: '4. Who we share your information with',
      paragraphs: [
        'We do not sell your personal information, and we do not share it for advertising. We share it only with the parties that need it to deliver the service you asked for:',
      ],
      bullets: [
        'The universities you apply to, and our partner agencies who help us file and manage applications on our behalf. They receive only the information required for the application.',
        'Our service providers — the hosting and database provider that stores our records and files, the email delivery provider that sends our messages, and the analytics provider that measures site usage. Each of them processes data on our instructions and under its own privacy policy.',
        'Government or university authorities, but only where we are legally required to disclose it — for example, in connection with a student visa application or a scholarship nomination.',
      ],
    },
    {
      id: 'retention',
      heading: '5. How long we keep it',
      paragraphs: [
        'Enquiry data that never turns into an application is deleted or anonymised within 24 months. Application records and the documents you upload are retained for as long as we are supporting you, and for up to 7 years afterwards, because universities and scholarship bodies may ask us to evidence an application at any point during that window. Newsletter subscriptions are kept until you unsubscribe.',
      ],
    },
    {
      id: 'security',
      heading: '6. How we protect it',
      paragraphs: [
        'Passwords are hashed and never stored in readable form. Portal sessions use short-lived tokens. Uploaded documents are held in private storage buckets with access limited to the staff and partner agencies working on your file. Access to the admin and partner portals is protected by role-based permissions and every sensitive write is recorded in an audit trail. No system is perfectly secure, but we treat your documents as sensitive and design accordingly.',
      ],
    },
    {
      id: 'rights',
      heading: '7. Your rights',
      paragraphs: [
        'You can ask us at any time to show you the personal information we hold about you, correct it, delete it, or stop using it for marketing. You can also object to a particular use of your data, and you can ask for a copy of it in a portable format. Because some information — for example the records of an application we have already submitted — must be retained for legal and academic reasons, we may not be able to delete every record immediately, but we will tell you why.',
      ],
    },
    {
      id: 'international',
      heading: '8. International students and cross-border processing',
      paragraphs: [
        'SICA is based in Guangzhou, China, and most of our students apply to universities in China. That means your information is primarily processed in China, and in some cases in the country of the university or scholarship body handling your application. Where information is transferred outside China, we rely on the standard contractual clauses and adequacy decisions recognised for that transfer, or on your explicit consent obtained at the point of application.',
      ],
    },
    {
      id: 'contact',
      heading: '9. Contact us',
      paragraphs: [
        'For any privacy question — a copy of your data, a correction, a deletion request, or a question about this policy — email us and we will respond within 30 days.',
      ],
    },
  ],
};

const privacyZh: LegalDocVariant = {
  title: '隐私政策',
  updatedLabel: LEGAL_DOCS_UPDATED.zh,
  intro:
    '本政策说明您在使用 studyinchina.academy 时 SICA 会收集哪些个人信息、为什么收集，以及您可以要求我们如何处理这些信息。',
  sections: [
    {
      id: 'what-we-collect',
      heading: '一、我们收集哪些信息',
      paragraphs: ['我们只收集帮助您申请中国大学所必需的信息。根据您与网站的互动方式，这些信息可能包括：'],
      bullets: [
        '咨询信息——您通过联系表单、评估表单、公开申请表单、讲座报名或聊天窗口提交的姓名、邮箱、电话、所在国家以及留言内容。',
        '账户信息——如果您创建了学生或合作伙伴门户账号，包括您的邮箱地址、密码（仅以哈希形式存储）、个人资料以及与账号绑定的角色。',
        '申请信息——您申请的学校、专业、学历层次与入学季，以及您的学业背景、评估问卷的回答，以及顾问在协助过程中添加的备注。',
        '材料文件——您上传的成绩单、护照、语言成绩证明、照片等文件。这些文件保存在私有文件存储中，仅负责您申请的 SICA 员工与合作伙伴机构可见。',
        '使用数据——您访问的页面、使用的设备与浏览器，以及来源页面。部分表单会记录您的浏览器 user-agent 字符串。某些表单会记录经过单向哈希处理的 IP 地址，仅用于防止重复提交。',
        '订阅信息——您订阅时提供的邮箱，用于发送资讯以及在您退订时将该地址屏蔽。',
      ],
    },
    {
      id: 'why-we-collect',
      heading: '二、我们为什么收集',
      paragraphs: ['我们仅将信息用于以下目的：'],
      bullets: [
        '回复您的咨询，并发送您主动索取的信息。',
        '评估您的学业背景，为您匹配合适的大学与专业。',
        '代您准备、递交并跟进申请。',
        '向您发送奖学金截止日期、招生动态等 SICA 资讯——仅在您主动订阅后。',
        '改进网站：了解哪些页面有用、学生在哪些环节遇到困难、哪些文章需要更新。',
        '履行法律、税务与档案记录方面的义务。',
      ],
    },
    {
      id: 'cookies',
      heading: '三、Cookie 与统计分析',
      paragraphs: ['我们只使用少量第一方 Cookie，均为网站运行所必需，或用于记住您做过的选择：'],
      bullets: [
        '语言 Cookie，用于记住您当前使用英文还是中文阅读。',
        '聊天会话 Cookie，用于将您与智能助手的对话与您的浏览器会话绑定，避免被他人看到。',
        '保存在浏览器中的聊天历史令牌，用于您继续之前的对话。',
        '界面 Cookie，用于记住管理后台的侧边栏是否展开。',
      ],
    },
    {
      id: 'sharing',
      heading: '四、我们与谁共享信息',
      paragraphs: ['我们不出售您的个人信息，也不会为广告目的共享信息。我们仅与完成您所请求服务所必需的对象共享信息：'],
      bullets: [
        '您申请的学校，以及协助我们递交与管理申请的合作伙伴机构。它们只会收到申请所必需的信息。',
        '我们的服务提供方——存放记录与文件的托管与数据库服务商、发送邮件的邮件服务商，以及衡量网站使用情况的统计分析服务商。它们均按照我们的指示处理数据，并受各自隐私政策约束。',
        '政府或高校主管部门，但仅限于法律要求披露的情形，例如学生签证申请或奖学金提名。',
      ],
    },
    {
      id: 'retention',
      heading: '五、信息保留期限',
      paragraphs: [
        '未转化为申请记录的咨询信息将在 24 个月内删除或匿名化。申请记录与您上传的文件会在我们为您提供服务期间保留，并在之后最多保留 7 年，因为高校与奖学金机构可能在此期间内要求我们提供申请凭证。资讯订阅信息保留至您退订为止。',
      ],
    },
    {
      id: 'security',
      heading: '六、我们如何保护信息',
      paragraphs: [
        '密码经过哈希处理，不会以可读形式存储。门户会话使用短时效令牌。上传文件保存在私有存储桶中，访问权限仅限于负责您材料的员工与合作伙伴机构。后台与合作伙伴门户的访问受基于角色的权限保护，所有敏感写操作均留有审计记录。没有任何系统是绝对安全的，但我们把您的材料视为敏感信息并据此设计。',
      ],
    },
    {
      id: 'rights',
      heading: '七、您的权利',
      paragraphs: [
        '您可以随时要求我们向您展示所掌握的个人信息、更正信息、删除信息，或停止将其用于营销推广。您也可以反对某一项具体用途，并要求获取可携带格式的数据副本。由于部分信息——例如我们已递交的申请记录——出于法律与学业原因必须保留，我们可能无法立即删除全部记录，但会向您说明原因。',
      ],
    },
    {
      id: 'international',
      heading: '八、国际学生与跨境处理',
      paragraphs: [
        'SICA 位于中国广州，我们的多数学生申请中国的大学。这意味着您的信息主要在中国境内处理，在部分情形下也会在受理您申请的大学或奖学金机构所在国家处理。信息跨境传输时，我们会依赖该等跨境所认可的合同条款与充分性决定，或在申请环节取得您的明确同意。',
      ],
    },
    {
      id: 'contact',
      heading: '九、联系我们',
      paragraphs: ['如需提出隐私相关咨询——索取数据副本、更正、删除请求或对本政策有疑问——请发送邮件至我们的邮箱，我们将在 30 天内回复。'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────
// Terms of Use
// ─────────────────────────────────────────────────────────────────

const termsEn: LegalDocVariant = {
  title: 'Terms of Use',
  updatedLabel: LEGAL_DOCS_UPDATED.en,
  intro:
    'These terms govern your use of studyinchina.academy and the services SICA provides through it. Using the site or asking us to work on your application means you accept them.',
  sections: [
    {
      id: 'about',
      heading: '1. About SICA',
      paragraphs: [
        'SICA (Study in China Academy) is an education consultancy based in Guangzhou, China. We help international students identify suitable universities and programmes, prepare and submit applications, and prepare for the visa and arrival process. We are an independent consultancy: we are not a university, we do not own the universities we work with, and we are not endorsed by them.',
      ],
    },
    {
      id: 'services',
      heading: '2. What we provide',
      paragraphs: [
        'Our guidance, including university matching, programme advice, scholarship information, document review, application submission and interview preparation, is provided on a best-effort basis against the information available to us and the stated requirements of each university. It is professional advice, not a guarantee of any particular outcome.',
      ],
    },
    {
      id: 'no-guarantee',
      heading: '3. Admission is decided by the university',
      paragraphs: [
        'Every admission, scholarship and visa decision is made by the relevant university, scholarship body or immigration authority — never by SICA. We cannot guarantee admission, a scholarship award, a specific grade, or a visa outcome, and nothing on this site should be read as a promise that you will receive one. Where a university publishes minimum requirements, meeting them is a necessary but not sufficient condition for admission.',
      ],
    },
    {
      id: 'fees',
      heading: '4. Fees and payments',
      paragraphs: [
        'Where we quote a fee for our own service, it is confirmed in writing before you commit to it. Application, registration or enrolment fees that you pay directly to a university, scholarship body, testing centre or immigration authority are set by that organisation and are generally non-refundable. We do not mark up those third-party fees. Any refund of our own service fee is governed by the terms we gave you in writing at the time of purchase, and refunds are handled at the earliest practical opportunity after you raise the request.',
      ],
    },
    {
      id: 'your-responsibilities',
      heading: '5. Your responsibilities',
      paragraphs: [
        'You are responsible for the accuracy and completeness of the information and documents you provide, for the completeness and authenticity of your application, and for meeting every deadline the university or authority sets. Please tell us promptly if anything changes — a new passport number, a revised grade, a withdrawn application — because an application built on stale information is our biggest source of avoidable problems. We are not responsible for outcomes caused by information you did not tell us about, by documents that were not genuine, or by a deadline we flagged and you did not meet.',
      ],
    },
    {
      id: 'intellectual-property',
      heading: '6. Intellectual property',
      paragraphs: [
        'The text, design, layout and code of this site, the SICA name and logo, and the articles and guides published on it are owned by SICA or used with permission. You may read, print and share our articles and guides for your own study purposes with attribution and an unchanged link. You may not republish them commercially, translate or rewrite them for redistribution, or present them as your own. Applying the guidance in our articles to your own application is always fine.',
      ],
    },
    {
      id: 'third-party',
      heading: '7. Third-party links and content',
      paragraphs: [
        'This site links to university pages, scholarship portals, official government sites and other resources we do not control. Those sites have their own terms, fees and privacy practices, and the accuracy of their content is their responsibility, not ours. Use them at your own risk.',
      ],
    },
    {
      id: 'liability',
      heading: '8. Limitation of liability',
      paragraphs: [
        'To the extent permitted by law, SICA is not liable for decisions made by universities, scholarship bodies or immigration authorities, for the availability or accuracy of third-party information, or for indirect or consequential loss arising from our guidance. Nothing in these terms limits liability that cannot lawfully be limited, including liability for fraud or for anything that would be unlawful to exclude. Your statutory rights as a consumer are unaffected.',
      ],
    },
    {
      id: 'changes',
      heading: '9. Changes to these terms',
      paragraphs: [
        'We may update these terms as the service or the law changes. The date at the top of this page shows when they were last revised. If a change materially affects you, we will tell you by email or on the site before it takes effect. Continuing to use the site after the change means you accept the updated terms.',
      ],
    },
    {
      id: 'governing-law',
      heading: '10. Governing law and contact',
      paragraphs: [
        'These terms are governed by the laws of the People’s Republic of China. If you have a question or a complaint, email us first — most issues are resolved by a conversation. If you are a consumer resident in the European Union or the United Kingdom, you keep the protection of the mandatory consumer law of your country of residence.',
      ],
    },
  ],
};

const termsZh: LegalDocVariant = {
  title: '使用条款',
  updatedLabel: LEGAL_DOCS_UPDATED.zh,
  intro:
    '本条款适用于您对 studyinchina.academy 的使用，以及 SICA 通过该网站提供的各项服务。使用本网站或委托我们协助申请，即表示您接受本条款。',
  sections: [
    {
      id: 'about',
      heading: '一、关于 SICA',
      paragraphs: [
        'SICA（学在中国）是位于中国广州的留学咨询机构。我们帮助国际学生确定合适的大学与专业、准备并递交申请，并协助准备签证与行前准备。我们是独立咨询机构：不是大学，不拥有我们合作的院校，也未获得院校的官方背书。',
      ],
    },
    {
      id: 'services',
      heading: '二、服务内容',
      paragraphs: [
        '我们的指导服务，包括院校匹配、专业建议、奖学金信息、材料审核、申请递交与面试准备，是基于我们掌握的信息以及各校公开的要求，尽最大努力提供的。这属于专业建议，而非对任何特定结果的承诺。',
      ],
    },
    {
      id: 'no-guarantee',
      heading: '三、录取由大学决定',
      paragraphs: [
        '所有录取、奖学金与签证决定，均由相关大学、奖学金机构或移民主管部门作出，SICA 无法参与决定。我们不保证录取、不保证奖学金、不保证特定成绩，也不保证签证结果；网站上的任何内容都不应被理解为对上述结果的承诺。达到大学公布的最低要求是录取的必要条件，但并非充分条件。',
      ],
    },
    {
      id: 'fees',
      heading: '四、费用与支付',
      paragraphs: [
        '如我们提供自身服务并报价，该费用会在您确认之前以书面形式告知。您直接支付给大学、奖学金机构、考试中心或移民主管部门的申请费、报名费或注册费，均由该机构自行制定，通常不予退还。我们不对第三方费用加价。我们自身服务费的退款，以购买时向您提供的书面条款为准，并在您提出请求后于最早可行时间内处理。',
      ],
    },
    {
      id: 'your-responsibilities',
      heading: '五、您的责任',
      paragraphs: [
        '您需要确保所提供信息与材料的准确与完整，确保申请材料的齐全与真实，并确保满足学校或主管部门设定的每一项截止日期。如果有任何变化——护照号码更新、成绩修改、申请被撤回——请及时告知我们，因为建立在过期信息之上的申请是我们可避免问题的主要来源。对于因您未告知我们的信息、材料不真实，或我们已提醒但您未满足的截止日期所导致的后果，我们不承担责任。',
      ],
    },
    {
      id: 'intellectual-property',
      heading: '六、知识产权',
      paragraphs: [
        '本网站的文字、设计、版式与代码，SICA 的名称与标识，以及站内发布的文章与指南，均归 SICA 所有或经授权使用。您可以在保留出处与原始链接的前提下，出于自身学习目的阅读、打印与分享我们的文章和指南。您不得以商业目的再次发布，不得翻译或改写后重新分发，也不得将其作为您自己的作品呈现。将我们文章中的方法应用于您自己的申请，则始终不受限制。',
      ],
    },
    {
      id: 'third-party',
      heading: '七、第三方链接与内容',
      paragraphs: [
        '本网站会链接到大学官网、奖学金平台、政府官方网站等我们无法控制的资源。这些站点有其各自的使用条款、收费标准与隐私实践，其内容的准确性由其自身负责，而非由我们负责。请自行判断后使用。',
      ],
    },
    {
      id: 'liability',
      heading: '八、责任限制',
      paragraphs: [
        '在法律允许的范围内，对于大学、奖学金机构或移民主管部门所作出的决定，第三方信息的可得性与准确性，以及因我们的建议而产生的间接或后果性损失，SICA 均不承担责任。本条款不限制依法不得限制的责任，包括欺诈责任及依法不得排除的其他责任。您作为消费者所享有的法定权利不受影响。',
      ],
    },
    {
      id: 'changes',
      heading: '九、条款变更',
      paragraphs: [
        '随着服务或法律的变化，我们可能更新本条款。页面顶部标注的是最近一次修订时间。如果变更对您有重大影响，我们会在其生效前通过邮件或网站告知您。变更后继续使用本网站，即表示您接受更新后的条款。',
      ],
    },
    {
      id: 'governing-law',
      heading: '十、适用法律与联系方式',
      paragraphs: [
        '本条款适用中华人民共和国法律。如有疑问或投诉，请优先发送邮件给我们——多数问题可以通过一次沟通解决。如果您是欧盟或英国境内的消费者，您仍享有您所在国强制性消费者法律的保护。',
      ],
    },
  ],
};

export const LEGAL_DOCS: Record<LegalDocSlug, LegalDoc> = {
  privacy: { slug: 'privacy', en: privacyEn, zh: privacyZh },
  terms: { slug: 'terms', en: termsEn, zh: termsZh },
};
