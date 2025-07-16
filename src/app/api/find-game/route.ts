// app/api/find-game/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate();

interface RequestBody {
  mood: string;
  genre: string;
  inspiration: string;
}

// Definisikan tipe untuk satu game dari AI
interface AiGameRecommendation {
  nama_game: string;
  ringkasan: string;
  tips: string[];
}

interface RawgPlatform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export async function POST(request: NextRequest) {
  const { mood, genre, inspiration }: RequestBody = await request.json();

  try {
    // 👇 1. PERUBAHAN PROMPT: Minta 3 game dan format output sebagai array JSON
    const prompt = `You are an expert game recommender. Your user wants three different game recommendations.
    User's criteria:
    - Desired Mood: "${mood}"
    - Favorite Genre: "${genre}"
    - A game they like for inspiration: "${inspiration || 'none provided'}"
    
    Based on this, recommend three different games. Provide your answer ONLY in a valid JSON format which is an array of objects.
    Example format: [{"nama_game": "Game A", "ringkasan": "...", "tips": ["..."]}, {"nama_game": "Game B", ...}, {"nama_game": "Game C", ...}]
    `;

    const output = await replicate.run(
      "ibm-granite/granite-3.3-8b-instruct",
      {
        input: {
          prompt: prompt,
          temperature: 0.95
        }
      }
    );

    const aiResponseString = (output as string[]).join('');
    // 👇 3. PARSE SEBAGAI ARRAY dari rekomendasi game
    const gameRecommendations: AiGameRecommendation[] = JSON.parse(aiResponseString);

    // 👇 4. AMBIL DETAIL DARI RAWG API UNTUK SEMUA 3 GAME SECARA BERSAMAAN (EFISIEN)
    const finalResults = await Promise.all(
      gameRecommendations.map(async (game) => {
        const rawgResponse = await fetch(`https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${encodeURIComponent(game.nama_game)}&page_size=1`);
        if (!rawgResponse.ok) {
          // Jika satu game gagal, kita tetap lanjutkan dengan data dari AI saja
          console.error(`Failed to fetch from RAWG for ${game.nama_game}`);
          return { ...game, gambar_url: '', platform: 'N/A', store_url: '' };
        }
        const rawgData = await rawgResponse.json();
        const gameDetails = rawgData.results?.[0];
        
        return {
          ...game,
          gambar_url: gameDetails?.background_image || '',
          platform: gameDetails?.platforms?.map((p: RawgPlatform) => p.platform.name).join(', ') || 'N/A',
          store_url: `https://rawg.io/games/${gameDetails?.slug || ''}`,
        };
      })
    );

    return NextResponse.json(finalResults);

  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}