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

  // Get keys to try
  const keysToTry = (adminConfig.manusApiKeys || [])
    .map(k => k.trim())
    .filter(k => k !== '');

  // Fallback to single key if empty
  if (keysToTry.length === 0 && adminConfig.manusApiKey) {
    keysToTry.push(adminConfig.manusApiKey.trim());
  }

  if (keysToTry.length === 0) {
    throw new Error('سیستەم کلیلێکی دەستنیشانکراوی نییە. تکایە لە لایەنی ئەدمین کلیل دابنێ.');
  }

  let lastError: any = null;

  for (let i = 0; i < keysToTry.length; i++) {
    const apiKey = keysToTry[i];
    console.log(`🔑 Trying Manus API key ${i + 1}/${keysToTry.length}...`);

    try {
      const baseUrl = adminConfig.manusBaseUrl.replace(/\/$/, '');
      const targetUrl = `${baseUrl}/chat/completions`;

      const requestBody = JSON.stringify({
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
      });

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };

      // Check if running in Capacitor (native app) - no CORS issues
      const isNativeApp = !!(window as any).Capacitor?.isNativePlatform?.();

      let response: Response | null = null;

      if (isNativeApp) {
        // Native app: direct call, no CORS proxy needed
        console.log('📱 Native app detected, calling API directly...');
        response = await fetch(targetUrl, {
          method: 'POST',
          headers,
          body: requestBody
        });
      } else {
        // Web: try direct first, then CORS proxies as fallback
        const corsProxies = [
          `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
        ];

        // Try direct first (may work on same-origin or relaxed CORS)
        try {
          console.log('🌐 Trying direct API call...');
          response = await fetch(targetUrl, {
            method: 'POST',
            headers,
            body: requestBody
          });
        } catch (directError) {
          console.log('⚠️ Direct call failed, trying CORS proxies...');
          // Try each proxy
          for (const proxyUrl of corsProxies) {
            try {
              console.log(`🔄 Trying proxy: ${proxyUrl.substring(0, 40)}...`);
              response = await fetch(proxyUrl, {
                method: 'POST',
                headers,
                body: requestBody
              });
              if (response.ok) break;
            } catch (proxyError) {
              console.log(`❌ Proxy failed, trying next...`);
              continue;
            }
          }
        }
      }

      if (!response) {
        throw new Error('All API connection methods failed');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Manus API error (key index ${i}): ${response.status} - ${errorText}`);
        throw new Error(`Manus API error: ${response.status} ${response.statusText}`);
      }

      const data: ManusChatResponse = await response.json();
      console.log('✅ Manus API responded successfully');

      return data.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.warn(`❌ Manus API key ${i + 1} failed:`, error);
      lastError = error;
    }
  }

  throw lastError || new Error('هەموو API کلیلەکان شکستیان هێنا. تکایە دواتر هەوڵ بدەرەوە.');
};
