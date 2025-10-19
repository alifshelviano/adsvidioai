// src/ai/recommender.ts

import type { HeyGenAvatar, HeyGenVoice } from '@/lib/heygen-assets';

/**
 * Informasi produk yang disediakan oleh pengguna untuk analisis.
 */
export interface ProductInfo {
  description: string;
  targetAudience?: string; // Contoh: "Pria dewasa", "Wanita muda", "Anak-anak"
  language?: string; // Contoh: "Indonesia", "English"
}

/**
 * Hasil rekomendasi, termasuk pilihan terbaik dan justifikasinya.
 */
export interface RecommendationResult {
  recommendedAvatar: HeyGenAvatar & { justification: string };
  recommendedVoice: HeyGenVoice & { justification: string };
}

/**
 * Menganalisis info produk dan merekomendasikan avatar dan suara terbaik.
 * 
 * @param info Informasi produk dari pengguna.
 * @param avatars Daftar avatar yang tersedia.
 * @param voices Daftar suara yang tersedia.
 * @returns Objek yang berisi avatar dan suara yang direkomendasikan beserta alasannya.
 */
export function getAssetRecommendation(
  info: ProductInfo,
  avatars: HeyGenAvatar[],
  voices: HeyGenVoice[]
): RecommendationResult {
  if (avatars.length === 0 || voices.length === 0) {
    throw new Error("Avatar and voice lists cannot be empty.");
  }

  let bestAvatar: HeyGenAvatar = avatars[0];
  let avatarJustification = "Avatar ini dipilih sebagai opsi default yang populer.";
  
  // --- Logika Rekomendasi Avatar ---
  const lowerCaseAudience = info.targetAudience?.toLowerCase() || '';
  if (lowerCaseAudience.includes('pria') || lowerCaseAudience.includes('laki')) {
    const maleAvatar = avatars.find(a => a.gender.toLowerCase() === 'male');
    if (maleAvatar) {
      bestAvatar = maleAvatar;
      avatarJustification = "Avatar pria direkomendasikan agar lebih relevan dengan target audiens pria.";
    }
  } else if (lowerCaseAudience.includes('wanita') || lowerCaseAudience.includes('perempuan')) {
    const femaleAvatar = avatars.find(a => a.gender.toLowerCase() === 'female');
    if (femaleAvatar) {
      bestAvatar = femaleAvatar;
      avatarJustification = "Avatar wanita direkomendasikan agar lebih relevan dengan target audiens wanita.";
    }
  }

  // --- Logika Rekomendasi Suara ---
  // 1. Tentukan bahasa target (default ke English jika tidak spesifik)
  const targetLang = info.language?.toLowerCase().includes('indonesia') ? 'id-ID' : 'en-US';
  const languageName = targetLang === 'id-ID' ? 'Bahasa Indonesia' : 'English';

  // 2. Cari suara yang cocok dengan bahasa DAN gender avatar yang direkomendasikan
  const genderMatchVoices = voices.filter(v => 
    v.language === targetLang && v.gender.toLowerCase() === bestAvatar.gender.toLowerCase()
  );
  
  let bestVoice: HeyGenVoice | undefined = genderMatchVoices[0];
  let voiceJustification = ``;

  if (bestVoice) {
    voiceJustification = `Suara ini dipilih karena menggunakan ${languageName} dan cocok dengan gender avatar yang direkomendasikan.`;
  } else {
    // 3. Fallback: Jika tidak ada yang cocok gender, cari suara apa pun dengan bahasa yang benar
    bestVoice = voices.find(v => v.language === targetLang);
    if (bestVoice) {
      voiceJustification = `Suara ini dipilih karena menggunakan ${languageName}.`;
    } else {
      // 4. Fallback paling akhir: Gunakan suara default (English) jika bahasa target tidak ada sama sekali
      bestVoice = voices.find(v => v.language === 'en-US') || voices[0];
      voiceJustification = "Suara ini dipilih sebagai opsi default berbahasa Inggris.";
    }
  }

  return {
    recommendedAvatar: { ...bestAvatar, justification: avatarJustification },
    // Cast needed because fallback might make bestVoice undefined in theory, but we guarantee it has a value.
    recommendedVoice: { ...(bestVoice as HeyGenVoice), justification: voiceJustification },
  };
}
