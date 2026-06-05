import { NextRequest } from 'next/server';
import { SICA_CHATBOT_SYSTEM_PROMPT, SICA_UNIVERSITY_CONTEXT_PROMPT } from '@/lib/ai/prompts';
import { getUniversityContext, getApplicationGuideContext, searchFAQ, sicaFAQ } from '@/lib/ai/knowledge';
import { universities, type University } from '@/lib/data';
import { getAIProvider } from '@/lib/ai/provider';

function buildRAGContext(userMessage: string) {
  let context = '';
  
  const universityContext = getUniversityContext(userMessage);
  if (universityContext) {
    context += `\n\n## Relevant University Information:\n${universityContext}`;
  }
  
  const relevantFAQs = searchFAQ(userMessage);
  if (relevantFAQs.length > 0) {
    context += `\n\n## Relevant FAQs:\n${relevantFAQs.slice(0, 3).map(faq => 
      `Q: ${faq.question}\nA: ${faq.answer}`
    ).join('\n\n')}`;
  }
  
  if (userMessage.toLowerCase().includes('apply') || 
      userMessage.toLowerCase().includes('application') ||
      userMessage.toLowerCase().includes('process') ||
      userMessage.toLowerCase().includes('step')) {
    context += `\n\n## Application Process Guide:\n${getApplicationGuideContext()}`;
  }
  
  return context;
}

function generateIntelligentResponse(userMessage: string, conversationHistory: Array<{ role: string; content: string }>): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Greeting responses
  if (lowerMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
    const greetings = [
      "Hello! 👋 Welcome to SICA! I'm here to help you with studying in China. What would you like to know about universities, programs, or the application process?",
      "Hi there! 😊 Great to connect! I'm your SICA AI Assistant, ready to help you explore studying in China. What's your main interest today?",
      "Hello and welcome! 🎓 I'm excited to help you learn about studying in China. Whether it's universities, scholarships, or applications - I'm here for you! Where shall we start?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // University specific questions
  for (const uni of universities) {
    if (lowerMessage.includes(uni.name.toLowerCase()) || 
        lowerMessage.includes(uni.nameCn) ||
        (uni.city.toLowerCase() && lowerMessage.includes(uni.city.toLowerCase()))) {
      return generateUniversityResponse(uni, userMessage);
    }
  }
  
  // FAQ matching
  const matchedFAQ = sicaFAQ.find(faq => 
    lowerMessage.includes(faq.question.toLowerCase().split(' ').slice(0, 3).join(' '))
  );
  
  if (matchedFAQ) {
    const followUps = [
      "\n\nIs there anything specific about this you'd like to know more about? I can also tell you about universities, programs, or other aspects of studying in China!",
      "\n\nWould you like to know more about related topics like universities, scholarships, or the application timeline? Feel free to ask!",
      "\n\nGreat question! Is there anything else about studying in China that you're curious about? I'm here to help with any part of the process!"
    ];
    return matchedFAQ.answer + followUps[Math.floor(Math.random() * followUps.length)];
  }
  
  // Application process questions
  if (lowerMessage.includes('apply') || lowerMessage.includes('application') || lowerMessage.includes('process')) {
    return `Excellent question! The application process for studying in China has several key steps: 📝

**Step 1: Research & Planning**
First, explore universities and programs that match your interests. Consider factors like:
- Field of study
- Location (Beijing, Shanghai, Hangzhou, etc.)
- Language of instruction (English or Chinese)
- Tuition fees and scholarships

**Step 2: Document Preparation**
You'll need to prepare:
- Passport copy
- Academic transcripts
- Graduation diploma/degree certificate
- Language proficiency (HSK for Chinese, TOEFL/IELTS for English)
- Personal statement
- Letters of recommendation

**Step 3: Application Submission**
Submit applications through the university portals or with SICA's assistance. Deadlines are usually 3-6 months before the semester starts.

**Step 4: Visa & Preparation**
Once accepted, apply for your X1/X2 visa and prepare for your journey!

SICA provides support at every step! What specific part of the process would you like to know more about? 😊`;
  }
  
  // Scholarship questions
  if (lowerMessage.includes('scholarship') || lowerMessage.includes('funding') || lowerMessage.includes('financial aid')) {
    return `Great question about scholarships! 💰 There are several excellent options for international students:

**Chinese Government Scholarship (CGS)**
- Full coverage: tuition, accommodation, stipend, medical insurance
- Very competitive but worth applying for
- Apply through Chinese embassies or universities

**University-Specific Scholarships**
- Many universities offer their own scholarships
- Tsinghua, Peking, Fudan all have international student scholarships
- Requirements vary by university

**Confucius Institute Scholarship**
- For Chinese language students
- Covers tuition and living expenses
- Great if you want to study Chinese first

**Provincial & City Scholarships**
- Many cities (Shanghai, Beijing, Hangzhou) offer local scholarships
- Often easier to obtain than national scholarships

SICA can help you identify and apply for scholarships you're eligible for! What's your field of interest? I can suggest universities with good scholarship options! 🎓`;
  }
  
  // Cost/Living questions
  if (lowerMessage.includes('cost') || lowerMessage.includes('expensive') || lowerMessage.includes('tuition') || lowerMessage.includes('living')) {
    return `Studying in China is actually very affordable compared to Western countries! 💴

**Tuition Fees**
- Undergraduate: ¥20,000-40,000/year ($2,800-$5,600)
- Graduate: ¥25,000-50,000/year ($3,500-$7,000)
- Top universities like Tsinghua/Peking are at the higher end

**Living Expenses**
- Beijing/Shanghai: ¥2,500-4,000/month ($350-$560)
- Other cities: ¥1,500-2,500/month ($210-$350)
- Includes accommodation, food, transport, entertainment

**Accommodation**
- On-campus dorms: ¥800-2,500/month
- Usually the most affordable and convenient option

Compared to the US, UK, or Australia, you'll save significantly while getting a world-class education! Would you like to know about specific university costs or scholarship options to help with expenses? 😊`;
  }
  
  // Visa questions
  if (lowerMessage.includes('visa') || lowerMessage.includes('x1') || lowerMessage.includes('x2')) {
    return `Visa information for studying in China! 🛂

**Visa Types**
- **X1 Visa**: For long-term study (over 180 days)
  - Multiple entries
  - Valid for the duration of your program
  - Requires admission letter and JW201/JW202 form
  
- **X2 Visa**: For short-term study (under 180 days)
  - Single or multiple entries
  - For exchange programs or short courses

**Application Process**
1. Receive university admission letter
2. Get JW201/JW202 form from university
3. Prepare documents: passport, photos, health certificate
4. Apply at Chinese embassy/consulate
5. Processing usually takes 4-10 working days

**Important Tips**
- Apply 1-2 months before travel
- X1 holders must apply for residence permit within 30 days of arrival
- Keep your admission documents safe!

SICA provides complete visa guidance and support! Do you have a specific visa question, or would you like to know about the timeline? 😊`;
  }
  
  // Life in China questions
  if (lowerMessage.includes('life') || lowerMessage.includes('student') || lowerMessage.includes('culture') || lowerMessage.includes('food')) {
    return `Student life in China is vibrant, exciting, and incredibly rewarding! 🌟

**Campus Life**
- Modern facilities and international student communities
- Many clubs, sports teams, and cultural activities
- International student offices to help with everything

**Food & Culture**
- Amazing Chinese cuisine - every region has its own specialties!
- From Peking duck to Shanghai soup dumplings
- Vegetarian options widely available
- Street food is popular and affordable

**Travel & Exploration**
- Excellent high-speed rail network
- Affordable domestic flights
- UNESCO World Heritage sites everywhere
- Festivals and cultural experiences year-round

**Safety & Convenience**
- Very safe cities with low crime rates
- Convenient mobile payment (WeChat/Alipay)
- Efficient public transportation
- 24/7 convenience stores

International students typically love their time in China! Is there a specific aspect of student life you're curious about? 😊`;
  }
  
  // General help - ask them what they're interested in
  const helpResponses = [
    `Great to hear from you! I'm here to help with all aspects of studying in China! 🎓

I can help you with:
• **Universities** - Tsinghua, Peking, Fudan, and more
• **Programs** - Find the right field of study
• **Applications** - Step-by-step guidance
• **Scholarships** - Funding opportunities
• **Visas** - Application process and requirements
• **Student Life** - What it's like living in China

What's your main goal or interest? Are you looking for engineering programs, business, humanities, or something else? I'd love to help you explore the options! 😊`,

    `Hello! I'm excited to help you on your journey to study in China! 🌏

Here are some ways I can assist:
1. **University Selection** - Which schools might be right for you
2. **Program Matching** - Finding courses in your field
3. **Application Help** - Understanding requirements and deadlines
4. **Scholarship Info** - Funding your education
5. **Visa Guidance** - Step-by-step process
6. **Pre-Departure Prep** - Getting ready for China

To give you the best help, could you tell me a bit about what you're looking for? What field do you want to study, and do you have any preferences for where in China you'd like to go? 😊`,

    `Welcome to SICA! 🎉 I'm your guide to everything related to studying in China.

Whether you're just starting to explore options or ready to apply, I can help:
• **University Information** - Learn about Tsinghua, Peking, Fudan, and more
• **Program Details** - Find English-taught or Chinese-taught programs
• **Application Steps** - From documents to submission
• **Scholarships** - Chinese Government, university-specific, and more
• **Life in China** - What to expect as an international student

What brings you to SICA today? Are you curious about a specific university, field of study, or part of the process? I'd love to help! 😊`
  ];
  
  return helpResponses[Math.floor(Math.random() * helpResponses.length)];
}

function generateUniversityResponse(uni: University, userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  const intro = [
    `Excellent choice! ${uni.name} is one of China's most prestigious universities! 🏛️`,
    `Great question about ${uni.name}! It's a fantastic institution! 🎓`,
    `Wonderful interest in ${uni.name}! Let me tell you all about it! ⭐`
  ][Math.floor(Math.random() * 3)];
  
  let details = `\n\n**About ${uni.name}**\n`;
  details += `• **Location**: ${uni.city} (${uni.cityCn})\n`;
  details += `• **Ranking**: #${uni.ranking} in China, ${uni.qsRanking}\n`;
  details += `• **Type**: ${uni.type}, Established ${uni.established}\n`;
  details += `• **Students**: ${uni.students} total, ${uni.intlStudents} international\n`;
  
  if (lowerMessage.includes('program') || lowerMessage.includes('course') || lowerMessage.includes('major') || lowerMessage.includes('study')) {
    details += `\n**Popular Programs at ${uni.name}**\n`;
    details += `• ${uni.popularPrograms.slice(0, 5).join('\n• ')}\n`;
  }
  
  if (lowerMessage.includes('tuition') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) {
    details += `\n**Tuition Fees**\n`;
    details += `• Undergraduate: ${uni.tuitionUndergrad}/year\n`;
    details += `• Graduate: ${uni.tuitionGraduate}/year\n`;
  }
  
  if (lowerMessage.includes('accommodation') || lowerMessage.includes('housing') || lowerMessage.includes('dorm')) {
    details += `\n**Accommodation**\n`;
    details += `• ${uni.accommodation}\n`;
    details += `• Cost: ${uni.accommodationCost}\n`;
  }
  
  const followUp = [
    `\n\n${uni.name} has so much to offer! Would you like to know more about their specific programs, application deadlines, scholarships, or student life there? I can also tell you about similar universidades if you'd like to compare options! 😊`,
    `\n\nI hope that gives you a good overview of ${uni.name}! Is there something specific you'd like to dive deeper into - their English-taught programs, application requirements, campus facilities, or something else? I'm here to help! 🎓`,
    `\n\n${uni.name} would be an excellent choice! What's your field of interest? I can help you explore the specific programs they offer in that area, and also suggest similar universidades that might be a good fit! 😊`
  ][Math.floor(Math.random() * 3)];

  // Append an inline card tag so the chat UI can render a
  // clickable university card. The tag is invisible — the
  // ChatCards parser replaces it with a real React card.
  // Place the card right after the intro+details, before the
  // follow-up, so it sits at the visual center of the message.
  return intro + details + `\n\n[[CARD:university:${uni.slug}]]` + followUp;
}

/**
 * Stream a chatbot reply from the configured AI provider (Doubao or
 * DeepSeek). Falls back to the rule-based response on any failure —
 * never throws to the client. The SSE envelope is `data: {"content":...}\n\n`
 * with a final `data: [DONE]\n\n`.
 */
async function streamProviderResponse(
  providerName: string,
  llmMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
): Promise<boolean> {
  try {
    const provider = getAIProvider();
    if (!provider.isConfigured) {
      console.log(`[AI Chat] ${providerName} not configured (AI_PROVIDER=${provider.name})`);
      return false;
    }

    console.log(`[AI Chat] Streaming via ${provider.name}...`);
    for await (const chunk of provider.stream(llmMessages, { temperature: 0.7 })) {
      if (chunk.content) {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`),
          );
        } catch (enqueueError) {
          // Client disconnected or controller was torn down mid-stream.
          // Stop consuming the provider to free its socket.
          console.warn(`[AI Chat] Controller closed mid-stream, aborting ${provider.name}`);
          return false;
        }
      }
      if (chunk.done) break;
    }
    console.log(`[AI Chat] ${provider.name} stream completed`);
    return true;
  } catch (error) {
    console.error(`[AI Chat] ${providerName} stream failed:`, error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lastUserMessage = messages
      .filter((m: { role: string; content: string }) => m.role === 'user')
      .pop()?.content || '';

    console.log('[AI Chat] Processing message:', lastUserMessage.substring(0, 100));

    // Build RAG context + full system prompt once (used by both LLM
    // and the rule-based fallback so the prompt surface is identical).
    const ragContext = buildRAGContext(lastUserMessage);
    const fullSystemPrompt = `${SICA_CHATBOT_SYSTEM_PROMPT}\n\n${SICA_UNIVERSITY_CONTEXT_PROMPT}${ragContext}`;

    const llmMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: fullSystemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // Surface which provider we'll use. The actual stream happens
    // inside the ReadableStream so we can swap mid-flight to the
    // rule-based fallback without throwing to the client.
    const provider = getAIProvider();
    const providerLabel = provider.isConfigured ? provider.name : 'fallback (no AI provider configured)';
    console.log(`[AI Chat] Routing to ${providerLabel}`);

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        const success = await streamProviderResponse(
          provider.name,
          llmMessages,
          controller,
          encoder,
        );
        if (!success) {
          console.log('[AI Chat] LLM stream failed or unconfigured, using rule-based fallback');
          await sendIntelligentResponse(lastUserMessage, messages, controller, encoder);
          return;
        }
        try {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (closeError) {
          // Controller already closed (e.g. dev-mode HMR teardown).
          // Safe to ignore — the client already received the stream.
          console.warn('[AI Chat] Controller already closed after LLM stream:', closeError);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[AI Chat] General error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function sendIntelligentResponse(
  userMessage: string,
  messages: Array<{ role: string; content: string }>,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  /**
   * Stream chunks word-by-word with a tiny per-word delay so the
   * chatbot feels responsive even when we're not hitting an LLM.
   * If the controller has already been closed (e.g. the LLM stream
   * partially succeeded then failed and closed the stream), every
   * enqueue would throw ERR_INVALID_STATE. Guard with a try/catch
   * and bail silently — the response is already done from the
   * caller's perspective.
   */
  const safeEnqueue = (data: string) => {
    try {
      controller.enqueue(encoder.encode(data));
      return true;
    } catch {
      return false;
    }
  };

  try {
    const response = generateIntelligentResponse(userMessage, messages);
    console.log('[AI Chat] Generated intelligent response, length:', response.length);

    // Stream word by word for a natural feel
    const words = response.split(/(\s+)/); // Keep whitespace
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word) {
        if (!safeEnqueue(`data: ${JSON.stringify({ content: word })}\n\n`)) {
          console.warn('[AI Chat] Controller already closed, aborting fallback stream');
          return;
        }
        // Variable delay for natural feel
        const delay = word.length > 10 ? 80 : word.length > 5 ? 50 : 30;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    safeEnqueue('data: [DONE]\n\n');
    try { controller.close(); } catch {}
  } catch (error) {
    console.error('[AI Chat] Error in intelligent response:', error);
    const fallbackResponse = "I'm here to help you with studying in China! Please try asking your question again, or feel free to ask about universities, programs, scholarships, or the application process. 😊";
    safeEnqueue(`data: ${JSON.stringify({ content: fallbackResponse })}\n\n`);
    safeEnqueue('data: [DONE]\n\n');
    try { controller.close(); } catch {}
  }
}