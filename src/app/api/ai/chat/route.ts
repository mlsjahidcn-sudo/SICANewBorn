import { NextRequest } from 'next/server';
import { SICA_CHATBOT_SYSTEM_PROMPT, SICA_UNIVERSITY_CONTEXT_PROMPT } from '@/lib/ai/prompts';
import { getUniversityContext, getApplicationGuideContext, searchFAQ, sicaFAQ } from '@/lib/ai/knowledge';
import { universities } from '@/lib/data';

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

function generateUniversityResponse(uni: any, userMessage: string): string {
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
    `\n\n${uni.name} has so much to offer! Would you like to know more about their specific programs, application deadlines, scholarships, or student life there? I can also tell you about similar universities if you'd like to compare options! 😊`,
    `\n\nI hope that gives you a good overview of ${uni.name}! Is there something specific you'd like to dive deeper into - their English-taught programs, application requirements, campus facilities, or something else? I'm here to help! 🎓`,
    `\n\n${uni.name} would be an excellent choice! What's your field of interest? I can help you explore the specific programs they offer in that area, and also suggest similar universities that might be a good fit! 😊`
  ][Math.floor(Math.random() * 3)];
  
  return intro + details + followUp;
}

async function callDoubaoAPI(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  const apiKey = process.env.DOUBAO_API_KEY;
  const baseUrl = process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  const model = process.env.DOUBAO_MODEL;

  if (!apiKey || !model) {
    console.log('[AI Chat] Doubao API not configured, falling back');
    return false;
  }

  try {
    console.log('[AI Chat] Calling Doubao API with model:', model);
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Chat] Doubao API error:', response.status, errorText);
      return false;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      console.error('[AI Chat] No response body from Doubao API');
      return false;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const jsonStr = trimmed.slice(6);
          const data = JSON.parse(jsonStr);
          const content = data.choices?.[0]?.delta?.content;
          
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
        } catch (parseError) {
          // Skip invalid JSON lines
          continue;
        }
      }
    }

    console.log('[AI Chat] Doubao API stream completed');
    return true;
  } catch (error) {
    console.error('[AI Chat] Doubao API call failed:', error);
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
      .filter((m: any) => m.role === 'user')
      .pop()?.content || '';

    console.log('[AI Chat] Processing message:', lastUserMessage.substring(0, 100));

    // Try Doubao API first if configured
    if (process.env.DOUBAO_API_KEY && process.env.DOUBAO_MODEL) {
      try {
        console.log('[AI Chat] Using Doubao API...');
        
        const ragContext = buildRAGContext(lastUserMessage);
        const fullSystemPrompt = `${SICA_CHATBOT_SYSTEM_PROMPT}\n\n${SICA_UNIVERSITY_CONTEXT_PROMPT}${ragContext}`;

        const llmMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          { role: 'system', content: fullSystemPrompt },
          ...messages.map((m: any) => ({
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content
          }))
        ];

        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
          async start(controller) {
            try {
              const success = await callDoubaoAPI(llmMessages, controller, encoder);
              if (!success) {
                console.log('[AI Chat] Doubao API failed, falling back to intelligent response');
                await sendIntelligentResponse(lastUserMessage, messages, controller, encoder);
              } else {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              }
            } catch (error) {
              console.error('[AI Chat] Stream error, falling back:', error);
              await sendIntelligentResponse(lastUserMessage, messages, controller, encoder);
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
      } catch (doubaoError) {
        console.log('[AI Chat] Doubao API not available, trying other options');
      }
    }

    // Try Coze SDK if available
    try {
      const { LLMClient, Config, HeaderUtils } = await import('coze-coding-dev-sdk');
      
      console.log('[AI Chat] Using Coze SDK...');
      
      const ragContext = buildRAGContext(lastUserMessage);
      const fullSystemPrompt = `${SICA_CHATBOT_SYSTEM_PROMPT}\n\n${SICA_UNIVERSITY_CONTEXT_PROMPT}${ragContext}`;

      const llmMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: fullSystemPrompt },
        ...messages.map((m: any) => ({
          role: m.role as 'system' | 'user' | 'assistant',
          content: m.content
        }))
      ];

      const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
      const config = new Config();
      const client = new LLMClient(config, customHeaders);

      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            const llmStream = client.stream(llmMessages, {
              model: 'doubao-seed-2-0-lite-260215',
              temperature: 0.7,
            });

            for await (const chunk of llmStream) {
              if (chunk.content) {
                const text = chunk.content.toString();
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
              }
            }

            console.log('[AI Chat] Coze SDK stream completed');
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (streamError) {
            console.error('[AI Chat] Coze SDK stream error, falling back:', streamError);
            await sendIntelligentResponse(lastUserMessage, messages, controller, encoder);
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
    } catch (sdkError) {
      console.log('[AI Chat] Coze SDK not available, using intelligent fallback');
    }

    // Fallback: Use intelligent rule-based responses
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        await sendIntelligentResponse(lastUserMessage, messages, controller, encoder);
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
  try {
    const response = generateIntelligentResponse(userMessage, messages);
    console.log('[AI Chat] Generated intelligent response, length:', response.length);
    
    // Stream word by word for a natural feel
    const words = response.split(/(\s+)/); // Keep whitespace
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: word })}\n\n`));
        // Variable delay for natural feel
        const delay = word.length > 10 ? 80 : word.length > 5 ? 50 : 30;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    controller.close();
  } catch (error) {
    console.error('[AI Chat] Error in intelligent response:', error);
    const fallbackResponse = "I'm here to help you with studying in China! Please try asking your question again, or feel free to ask about universities, programs, scholarships, or the application process. 😊";
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: fallbackResponse })}\n\n`));
    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    controller.close();
  }
}