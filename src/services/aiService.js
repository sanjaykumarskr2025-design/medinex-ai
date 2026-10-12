/**
 * AI Service supporting Anthropic, OpenAI, and a built-in Demo fallback mode.
 *
 * Enforces medical safety guardrails (not a doctor, emergency warnings,
 * language adaptation).
 */

import config from '../config/env.js';

const SYSTEM_PROMPT = `You are VitaNex AI, a professional, empathetic personal health information assistant and copilot.
Your role is to help users organize health records, prepare for doctor appointments, understand general health concepts, and track wellness goals.

CRITICAL SAFETY RULES:
1. You are NOT a doctor or licensed medical clinician. Never diagnose diseases, prescribe treatments, or provide definitive medical advice.
2. For any concerning symptom, chronic condition question, or test interpretation, explicitly recommend consulting a qualified healthcare professional.
3. If a user describes emergency symptoms (chest pain, severe shortness of breath, sudden weakness, severe bleeding, thoughts of self-harm), immediately instruct them to contact local emergency services (e.g., 911 or local emergency number) right away.
4. Keep answers clear, structured, and easy to read using Markdown formatting.
5. Respond in the language requested by the user.`;

/**
 * Generate a response using the configured AI provider.
 */
export async function generateAIResponse({ prompt, conversationHistory = [], language = 'en' }) {
  const provider = config.ai.provider;

  // 1. Demo Mode Fallback
  if (provider === 'demo' || !config.ai.apiKey) {
    return generateDemoResponse(prompt, language);
  }

  // 2. Anthropic API
  if (provider === 'anthropic') {
    try {
      const messages = [
        ...conversationHistory,
        { role: 'user', content: prompt }
      ];

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.ai.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.ai.model || 'claude-sonnet-5',
          max_tokens: 1500,
          system: SYSTEM_PROMPT + `\nRespond in language code: ${language}.`,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[aiService] Anthropic API error:', response.status, errText);
        throw new Error('AI service returned an error. Falling back to demo guidance.');
      }

      const data = await response.json();
      const reply = data.content?.[0]?.text || 'I am here to help with your health questions.';
      return reply;
    } catch (err) {
      console.error('[aiService] Anthropic call failed, using demo fallback:', err.message);
      return generateDemoResponse(prompt, language) + '\n\n*(Note: Live AI service encountered an issue, showing demo guidance)*';
    }
  }

  // 3. OpenAI API
  if (provider === 'openai') {
    try {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT + `\nRespond in language code: ${language}.` },
        ...conversationHistory,
        { role: 'user', content: prompt }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.ai.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error('OpenAI API returned an error');
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Hello! How can I assist your health journey today?';
    } catch (err) {
      console.error('[aiService] OpenAI call failed:', err.message);
      return generateDemoResponse(prompt, language);
    }
  }

  return generateDemoResponse(prompt, language);
}

/**
 * Intelligent demo mode responses matching common health queries.
 */
function generateDemoResponse(prompt, language) {
  const p = prompt.toLowerCase();
  let reply = '';

  if (p.includes('headache') || p.includes('pain') || p.includes('fever')) {
    reply = `### [Demo Mode] Health Guidance\n\nSymptoms like headaches, pain, or fever can stem from many causes ranging from simple dehydration or stress to infections.\n\n**Recommended Steps:**\n- Rest in a quiet, darkened room if experiencing a headache.\n- Stay well-hydrated with water or electrolyte solutions.\n- Track when the symptoms started and their intensity.\n\n> **Medical Disclaimer:** I am an AI assistant, not a doctor. If pain persists, worsens significantly, or is accompanied by neurological symptoms, please consult a physician immediately.`;
  } else if (p.includes('appointment') || p.includes('doctor') || p.includes('prepare')) {
    reply = `### [Demo Mode] Doctor Appointment Preparation\n\nPreparing for your visit helps ensure you get the most out of your consultation:\n\n1. **List Your Symptoms:** Note when they occur and what triggers them.\n2. **Medication List:** Bring exact names and dosages of all prescriptions and supplements.\n3. **Key Questions to Ask:**\n   - *What is the most likely cause of my symptoms?*\n   - *What tests do you recommend, and why?*\n   - *What lifestyle changes can help support my treatment?*\n4. **Log Metrics:** Bring recent blood pressure, sleep, or glucose logs if tracked.`;
  } else if (p.includes('blood pressure') || p.includes('bp') || p.includes('heart')) {
    reply = `### [DemoMode] Understanding Blood Pressure\n\nBlood pressure is measured in millimeters of mercury (mmHg) with two numbers: systolic (top) and diastolic (bottom).\n\n- **Normal:** Below 120 / 80 mmHg\n- **Elevated:** 120-129 / less than 80\n- **Hypertension Stage 1:** 130-139 / 80-89\n\n**Tips for accurate measurement:**\n- Sit quietly with feet flat for 5 minutes before measuring.\n- Keep your arm supported at heart level.\n\n*Always consult your cardiologist or primary care physician for interpretation of your readings.*`;
  } else {
    reply = `### [Demo Mode] VitaNex AI Copilot\n\nThank you for your question about **"${prompt}"**.\n\nAs your personal health copilot, I can help you organize records, prepare for upcoming visits, track wellness metrics, and explain general health concepts.\n\n**How can I help further today?** Remember to discuss any medical concerns directly with a licensed healthcare provider.`;
  }

  if (language === 'ta') {
    reply = `*[டெமோ முறை]*\n\nவணக்கம்! உங்கள் உடல்நல கேள்விக்கு நன்றி. நான் ஒரு வழிகாட்டி மட்டுமே, மருத்துவர் அல்ல. அவசர காலங்களில் உடனடியாக மருத்துவரை அணுகவும்.\n\n` + reply;
  } else if (language === 'hi') {
    reply = `*[डेमो मोड]*\n\nनमस्ते! आपके स्वास्थ्य प्रश्न के लिए धन्यवाद। यह सामान्य जानकारी है, चिकित्सीय निदान नहीं।`;
  } else if (language === 'es') {
    reply = `*[Modo Demo]*\n\nHola. Gracias por tu consulta. Esta es información general de salud y no reemplaza el consejo médico profesional.`;
  }

  return reply;
}
