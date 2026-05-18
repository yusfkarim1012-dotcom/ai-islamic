// Supabase Edge Function for Groq Text-to-Speech
// Proxies requests to Groq API to bypass CORS restrictions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') || '';
const GROQ_TTS_URL = 'https://api.groq.com/openai/v1/audio/speech';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice = 'fahad' } = await req.json()

    if (!text || text.length < 5) {
      return new Response(
        JSON.stringify({ error: 'النص قصير جداً' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Clean text for TTS
    let cleaned = text
      .replace(/##\s*(المصادر|سەرچاوەکان|Sources|References)[\s\S]*/gi, '')
      .replace(/\[[\u0660-\u0669\u06F0-\u06F90-9]+\]/g, '')
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[﴿﴾#*_`~>،,:;!?؟!\-–—()[\]{}""«»]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (cleaned.length > 3500) {
      cleaned = cleaned.substring(0, 3500)
    }

    console.log(`TTS Request: ${text.length} -> ${cleaned.length} chars`)

    const response = await fetch(GROQ_TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'canopylabs/orpheus-arabic-saudi',
        voice: voice,
        response_format: 'wav',
        input: cleaned
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Groq TTS Error:', response.status, error)
      return new Response(
        JSON.stringify({ error: `فشل التحويل: ${response.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      )
    }

    const audioData = await response.arrayBuffer()

    return new Response(audioData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/wav',
      }
    })

  } catch (error) {
    console.error('TTS Function Error:', error)
    return new Response(
      JSON.stringify({ error: 'خطأ في الخادم' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
