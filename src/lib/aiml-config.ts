// AIML API Configuration with improved key rotation
// When one key hits rate limits, automatically switch to the next
// Persists current key index to localStorage for better rotation

const API_KEYS = [
  '130b2cfdde4b45be9e6f93bc79e72974',
  'bdf8da39df96489f9c602c0a30577ec8',
  '8c9533318159428c82ba7e65055ee1e4'
];

const BASE_URL = 'https://api.aimlapi.com/v1';
const STORAGE_KEY = 'aikurdi_api_key_index';

// Get current key index from localStorage or default to 0
const getStoredKeyIndex = (): number => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const index = parseInt(stored, 10);
      if (!isNaN(index) && index >= 0 && index < API_KEYS.length) {
        return index;
      }
    }
  } catch {
    // localStorage not available
  }
  return 0;
};

// Save current key index to localStorage
const saveKeyIndex = (index: number) => {
  try {
    localStorage.setItem(STORAGE_KEY, index.toString());
  } catch {
    // localStorage not available
  }
};

// Model mappings for AIML API
export const AIML_MODELS = {
  detailed: 'google/gemini-3-pro-preview',
  very_detailed: 'anthropic/claude-opus-4-5',
  premium: 'zhipu/glm-4.7'
} as const;

export interface AIMLChatResponse {
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

export const callAIMLApi = async (
  prompt: string,
  modelKey: keyof typeof AIML_MODELS,
  systemPrompt: string
): Promise<string> => {
  const model = AIML_MODELS[modelKey];
  let lastError: Error | null = null;
  let startIndex = getStoredKeyIndex();

  // Try each API key starting from the stored index
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    const keyIndex = (startIndex + attempt) % API_KEYS.length;
    const apiKey = API_KEYS[keyIndex];

    console.log(`🔑 Trying API key ${keyIndex + 1}/${API_KEYS.length}...`);

    try {
      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
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
          max_tokens: 4096
        })
      });

      // Check for rate limit or payment errors
      if (response.status === 429 || response.status === 402 || response.status === 403) {
        console.warn(`⚠️ API key ${keyIndex + 1} hit limit (${response.status}), trying next...`);
        // Move to next key for future requests
        const nextIndex = (keyIndex + 1) % API_KEYS.length;
        saveKeyIndex(nextIndex);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API error: ${response.status} - ${errorText}`);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: AIMLChatResponse = await response.json();

      // Success! Save this key index for next time
      saveKeyIndex(keyIndex);
      console.log(`✅ API key ${keyIndex + 1} worked successfully`);

      return data.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.warn(`❌ API key ${keyIndex + 1} failed:`, error);
      lastError = error as Error;

      // Move to next key for future requests
      const nextIndex = (keyIndex + 1) % API_KEYS.length;
      saveKeyIndex(nextIndex);
      continue;
    }
  }

  throw lastError || new Error('هەموو API کلیلەکان شکستیان هێنا. تکایە دواتر هەوڵ بدەرەوە.');
};

