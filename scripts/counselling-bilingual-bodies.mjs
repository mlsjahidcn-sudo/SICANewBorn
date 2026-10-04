// One-shot template updater for bilingual bodies (Phase 124 follow-up).
// Reads the 8 counselling templates from DB and writes a single
// bilingual body into both body_text and body_text_zh so the recipient
// always sees English + Chinese regardless of their locale.
import { getSupabaseServer } from '../src/lib/supabase-server.ts';

const slugs = [
  'counselling.confirmed',
  'counselling.rescheduled',
  'counselling.cancelled',
  'counselling.completed',
  'counselling.no_show',
  'counselling.meeting_link_updated',
  'counselling.reminder_24h',
  'counselling.reminder_2h',
];

const divider = '\n— — — — — — — — — — — — — — — — — — — — — — — — — —\n';

function bilingual(enBody, zhBody) {
  return `${enBody}\n${divider}\n${zhBody}`;
}

const bodies = {
  'counselling.confirmed': bilingual(
    `English:

Hi {{name}},

Your free 10-minute counselling session with SICA is confirmed.

Reference: {{reference}}
Session time: {{slotLabel}}
{{meetingLine}}

A calendar invite (.ics) is attached — open it to add the session to your calendar.
Need to reschedule or cancel? Just reply to this email.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}`,
    `中文:

您好 {{name}},

您的 SICA 免费 10 分钟在线咨询已确认。

预约编号：{{reference}}
咨询时间：{{slotLabel}}
{{meetingLine}}

日历邀请(.ics)已附在本邮件中,点击即可添加到您的日历。
如需改期或取消,请直接回复本邮件。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}`,
  ),
  'counselling.rescheduled': bilingual(
    `English:

Hi {{name}},

Your SICA counselling session has been moved.

Reference: {{reference}}
Previous time: {{previousSlotLabel}}
New time: {{slotLabel}}
{{meetingLine}}

A fresh calendar invite (.ics) is attached — please update your calendar.
If the new time doesn't work, reply to this email and we'll find another slot.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}`,
    `中文:

您好 {{name}},

您的 SICA 咨询已被改期。

预约编号：{{reference}}
原咨询时间：{{previousSlotLabel}}
新咨询时间：{{slotLabel}}
{{meetingLine}}

新的日历邀请(.ics)已附在本邮件中,请更新您的日历。
如新时间不合适,请直接回复本邮件,我们会再次调整。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}`,
  ),
  'counselling.cancelled': bilingual(
    `English:

Hi {{name}},

Your SICA free counselling session has been cancelled.

Reference: {{reference}}
Original time: {{slotLabel}}

You can book a new time any moment: {{siteUrl}}/counselling
Any questions — just reply to this email.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}`,
    `中文:

您好 {{name}},

很抱歉,您预约的 SICA 免费咨询已被取消。

预约编号：{{reference}}
原咨询时间：{{slotLabel}}

您可以随时重新预约:{{siteUrl}}/counselling
如有任何疑问,直接回复本邮件即可。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}`,
  ),
  'counselling.completed': bilingual(
    `English:

Hi {{name}},

Thanks for your free 10-minute chat with SICA on {{slotLabel}}.

Reference: {{reference}}

If you'd like to keep going, you can book another session any time: {{siteUrl}}/counselling
Or start a formal application: {{siteUrl}}/assessment

Any questions, just reply to this email.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}`,
    `中文:

您好 {{name}},

感谢您于 {{slotLabel}} 与 SICA 完成的免费 10 分钟咨询。

预约编号：{{reference}}

如您希望继续沟通,可随时再预约一次:{{siteUrl}}/counselling
或直接开始正式申请:{{siteUrl}}/assessment

如有疑问,请直接回复本邮件。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}`,
  ),
  'counselling.no_show': bilingual(
    `English:

Hi {{name}},

We didn't connect on your SICA counselling session scheduled for {{slotLabel}} — totally fine, things come up.

Reference: {{reference}}

Whenever you're ready, pick a new time here: {{siteUrl}}/counselling
Or message us on WhatsApp +86 173 2576 4171 and we'll find one for you.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}`,
    `中文:

您好 {{name}},

您原定 {{slotLabel}} 的 SICA 咨询我们没能连上——没关系,临时有事很正常。

预约编号：{{reference}}

您方便时,可以重新预约:{{siteUrl}}/counselling
或通过 WhatsApp +86 173 2576 4171 联系我们,我们帮您安排。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}`,
  ),
  'counselling.meeting_link_updated': bilingual(
    `English:

Hi {{name}},

We've updated the meeting link for your counselling session.

Reference: {{reference}}
Session time: {{slotLabel}}
New meeting link: {{meetingLine}}

A fresh calendar invite (.ics) is attached with the new link.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}`,
    `中文:

您好 {{name}},

您的咨询会议链接已更新。

预约编号：{{reference}}
咨询时间：{{slotLabel}}
新会议链接：{{meetingLine}}

新的日历邀请(.ics)已附在邮件中。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}`,
  ),
  'counselling.reminder_24h': bilingual(
    `English:

Hi {{name}},

A friendly reminder: your free SICA counselling session is in 24 hours.

Reference: {{reference}}
Session time: {{slotLabel}}
{{meetingLine}}

Need help? WhatsApp us any time: https://wa.me/8617325764171

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}`,
    `中文:

您好 {{name}},

温馨提示:您的 SICA 免费咨询 24 小时后开始。

预约编号：{{reference}}
咨询时间：{{slotLabel}}
{{meetingLine}}

如需帮助,随时 WhatsApp 联系我们:https://wa.me/8617325764171

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}`,
  ),
  'counselling.reminder_2h': bilingual(
    `English:

Hi {{name}},

A friendly reminder: your free SICA counselling session is starting soon.

Reference: {{reference}}
Session time: {{slotLabel}}
{{meetingLine}}

Need help? WhatsApp us any time: https://wa.me/8617325764171

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}`,
    `中文:

您好 {{name}},

温馨提示:您的 SICA 免费咨询即将开始。

预约编号：{{reference}}
咨询时间：{{slotLabel}}
{{meetingLine}}

如需帮助,随时 WhatsApp 联系我们:https://wa.me/8617325764171

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}`,
  ),
};

const supabase = getSupabaseServer();
if (!supabase) {
  console.error('Supabase not configured');
  process.exit(1);
}

let updated = 0;
let failed = 0;
for (const slug of slugs) {
  const body = bodies[slug];
  const { error } = await supabase
    .from('email_templates')
    .update({ body_text: body, body_text_zh: body })
    .eq('slug', slug);
  if (error) {
    console.error(`FAIL ${slug}:`, error.message);
    failed += 1;
  } else {
    console.log(`OK ${slug} (${body.length} bytes)`);
    updated += 1;
  }
}
console.log(`\nupdated=${updated} failed=${failed}`);
process.exit(failed === 0 ? 0 : 1);
