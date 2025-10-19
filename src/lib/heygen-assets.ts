// src/lib/heygen-assets.ts

// Definisikan tipe data berdasarkan respons API Anda
export interface HeyGenAvatar {
  avatar_id: string;
  avatar_name: string;
  gender: string; // 'Male' | 'Female' | 'Unknown'
  preview_image_url: string;
}

export interface HeyGenVoice {
  voice_id: string;
  language: string;
  gender: string;
  name: string;
  preview_audio: string;
}

// Variabel untuk menyimpan cache di memori
let cachedAvatars: HeyGenAvatar[] = [];
let cachedVoices: HeyGenVoice[] = [];
let lastFetchTime = 0;

// Atur durasi cache (misalnya, 24 jam dalam milidetik)
const CACHE_DURATION = 1000 * 60 * 60 * 24;

async function fetchFromHeyGen(endpoint: string) {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    console.error("HEYGEN_API_KEY is not set in environment variables.");
    throw new Error("HEYGEN_API_KEY is not set.");
  }
  
  const response = await fetch(`https://api.heygen.com/v2/${endpoint}`, {
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Failed to fetch from HeyGen ${endpoint}:`, errorBody);
    throw new Error(`Failed to fetch from HeyGen ${endpoint}`);
  }
  return response.json();
}

/**
 * Mengambil daftar avatar yang tersedia dari HeyGen, dengan caching.
 * @returns {Promise<HeyGenAvatar[]>} Sebuah promise yang menghasilkan array objek avatar.
 */
export async function getAvailableAvatars(): Promise<HeyGenAvatar[]> {
  const now = Date.now();
  if (cachedAvatars.length > 0 && (now - lastFetchTime < CACHE_DURATION)) {
    console.log('Returning cached avatars.');
    return cachedAvatars;
  }
  
  console.log('Fetching fresh avatars from HeyGen.');
  const data = await fetchFromHeyGen('avatars');
  // Berdasarkan dokumen API, daftar berada di bawah data.avatars
  cachedAvatars = data?.data?.avatars || []; 
  lastFetchTime = now;
  return cachedAvatars;
}

/**
 * Mengambil daftar suara yang tersedia dari HeyGen, dengan caching.
 * @returns {Promise<HeyGenVoice[]>} Sebuah promise yang menghasilkan array objek suara.
 */
export async function getAvailableVoices(): Promise<HeyGenVoice[]> {
    const now = Date.now();
    if (cachedVoices.length > 0 && (now - lastFetchTime < CACHE_DURATION)) {
      console.log('Returning cached voices.');
      return cachedVoices;
    }

    console.log('Fetching fresh voices from HeyGen.');
    const data = await fetchFromHeyGen('voices');
    // Berdasarkan dokumen API, daftar berada di bawah data.voices
    cachedVoices = data?.data?.voices || [];
    return cachedVoices;
}
