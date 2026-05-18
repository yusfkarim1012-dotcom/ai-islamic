// Manus API Configuration for Gemini 2.5 Flash
// This uses the Manus proxy to access Gemini models
// Settings can be changed from admin panel

import { getAdminConfig, getModelById } from './admin-config';

export interface ManusMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ManusChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const callManusApi = async (
  prompt: string,
  systemPrompt: string
): Promise<string> => {
  const adminConfig = getAdminConfig();
  const manusModel = getModelById('manus');
  const modelName = manusModel?.model || 'gemini-2.5-flash';

  console.log(`🔮 Calling Manus API with ${modelName}...`);

  try {
    const baseUrl = adminConfig.manusBaseUrl.replace(/\/$/, '');
    const targetUrl = `${baseUrl}/chat/completions`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminConfig.manusApiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Manus API error: ${response.status} - ${errorText}`);
      throw new Error(`Manus API error: ${response.status} ${response.statusText}`);
    }

    const data: ManusChatResponse = await response.json();
    console.log('✅ Manus API responded successfully');

    return data.choices[0]?.message?.content || 'No response received';
  } catch (error) {
    console.error('❌ Manus API failed:', error);
    throw error;
  }
};
