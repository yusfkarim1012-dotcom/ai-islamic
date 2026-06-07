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
  systemPrompt: string,
  selectedMode?: string
): Promise<string> => {
  const adminConfig = getAdminConfig();
  const manusModel = getModelById('manus');
  const modelName = manusModel?.model || 'gemini-2.5-flash';

  const isBluesmindsDisabled = adminConfig.serverDisabled === 'bluesminds';
  const isManusDisabled = adminConfig.serverDisabled === 'manus';
  const isManusFirst = selectedMode === 'manus'
    ? true
    : selectedMode === 'bluesminds'
      ? false
      : adminConfig.serverPriority === 'manus_first';

  let lastError: any = null;

  // Helper to fetch using CORS proxies
  const fetchWithCors = async (targetUrl: string, headers: any, requestBody: string): Promise<Response> => {
    const isNativeApp = !!(window as any).Capacitor?.isNativePlatform?.();
    if (isNativeApp) {
      return await fetch(targetUrl, { method: 'POST', headers, body: requestBody });
    }
    
    // Web: try direct first, then proxies
    try {
      console.log(`🌐 Trying direct API call to ${targetUrl}...`);
      const response = await fetch(targetUrl, { method: 'POST', headers, body: requestBody });
      if (response.ok) return response;
    } catch (directError) {
      console.log('Direct call failed, trying CORS proxies...');
    }

    const corsProxies = [
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    ];

    for (const proxyUrl of corsProxies) {
      try {
        console.log(`🔄 Trying proxy: ${proxyUrl.substring(0, 40)}...`);
        const response = await fetch(proxyUrl, { method: 'POST', headers, body: requestBody });
        if (response.ok) return response;
      } catch (proxyError) {
        continue;
      }
    }
    throw new Error('All connection methods failed');
  };

  const tryBluesminds = async (): Promise<string | null> => {
    if (isBluesmindsDisabled) {
      console.log('Bluesminds is disabled by admin, skipping...');
      return null;
    }
    const keys = (adminConfig.bluesmindsApiKeys || [])
      .map(k => k.trim())
      .filter(k => k !== '');
    if (keys.length === 0 && adminConfig.bluesmindsApiKey) {
      keys.push(adminConfig.bluesmindsApiKey.trim());
    }
    if (keys.length === 0) return null;

    for (let i = 0; i < keys.length; i++) {
      const apiKey = keys[i];
      try {
        const baseUrl = (adminConfig.bluesmindsBaseUrl || 'https://api.bluesminds.com/v1').replace(/\/$/, '');
        console.log(`🔮 Trying Bluesminds API with key ${i + 1}/${keys.length}...`);
        const response = await fetchWithCors(
          `${baseUrl}/chat/completions`,
          { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          JSON.stringify({
            model: adminConfig.bluesmindsModel || 'gemini-2.5-flash',
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 4096
          })
        );
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Bluesminds API responded successfully');
          return data.choices[0]?.message?.content || 'No response received';
        }
      } catch (err) {
        console.warn(`Bluesminds key index ${i} failed:`, err);
        lastError = err;
      }
    }
    return null;
  };

  const tryManus = async (): Promise<string | null> => {
    if (isManusDisabled) {
      console.log('Manus is disabled by admin, skipping...');
      return null;
    }
    const keys = (adminConfig.manusApiKeys || [])
      .map(k => k.trim())
      .filter(k => k !== '');
    if (keys.length === 0 && adminConfig.manusApiKey) {
      keys.push(adminConfig.manusApiKey.trim());
    }
    if (keys.length === 0) return null;

    for (let i = 0; i < keys.length; i++) {
      const apiKey = keys[i];
      try {
        const baseUrl = (adminConfig.manusBaseUrl || 'https://api.manus.im/api/llm-proxy/v1').replace(/\/$/, '');
        console.log(`🔮 Trying Manus API with key ${i + 1}/${keys.length}...`);
        const response = await fetchWithCors(
          `${baseUrl}/chat/completions`,
          { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          JSON.stringify({
            model: modelName,
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 4096
          })
        );
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Manus API responded successfully');
          return data.choices[0]?.message?.content || 'No response received';
        }
      } catch (err) {
        console.warn(`Manus key index ${i} failed:`, err);
        lastError = err;
      }
    }
    return null;
  };

  const firstTry = isManusFirst ? tryManus : tryBluesminds;
  const secondTry = isManusFirst ? tryBluesminds : tryManus;

  const result1 = await firstTry();
  if (result1) return result1;

  console.log('First server failed or disabled, trying second...');
  const result2 = await secondTry();
  if (result2) return result2;

  throw lastError || new Error('هەموو API کلیلەکان شکستیان هێنا. تکایە دواتر هەوڵ بدەرەوە.');
};
