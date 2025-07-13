// app/api/find-game/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate'; // 👈 1. Import library Replicate

// Inisialisasi Replicate client.
// Library ini secara otomatis akan membaca REPLICATE_API_TOKEN dari .env.local
const replicate = new Replicate();

interface RequestBody {
  mood: string;
  genre: string;
  inspiration: string;
}

export async function POST(request: NextRequest) {
  const { mood, genre, inspiration }: RequestBody = await request.json();

  try {
    // 2. Siapkan prompt untuk IBM Granite
    const prompt = `You are an expert game recommender. Your user wants a single game recommendation.
    User's criteria:
    - Desired Mood: "${mood}"
    - Favorite Genre: "${genre}"
    - A game they like for inspiration: "${inspiration || 'none provided'}"
    
    Based on this, recommend one single game. Provide your answer ONLY in a valid JSON format like this example, with no other text before or after the JSON block:
    {"nama_game": "The Witcher 3: Wild Hunt", "ringkasan": "A brief summary explaining why you recommend this game based on the user's criteria.", "tips": ["A non-spoiler tip for starting.", "Another useful tip.", "A third tip."]}
    `;

    // 3. Panggil model IBM Granite di Replicate
    console.log('Running Replicate with prompt...');
    const output = await replicate.run(
      // 👇 Ganti dengan nama model & versi yang Anda temukan di Replicate
      "ibm-granite/granite-3.3-8b-instruct",
      {
        input: {
          prompt: prompt,
          temperature: 0.85
          // Beberapa model mungkin membutuhkan parameter lain, cek tab "API" di halaman model Replicate
        }
      }
    );
    console.log('Finished running Replicate.');

    // 4. Proses output dari Replicate
    // Output dari model chat biasanya berupa array string, kita gabungkan menjadi satu.
    const aiResponseString = (output as string[]).join('');
    const gameData = JSON.parse(aiResponseString);

    // 5. Ambil data tambahan dari RAWG API (logika ini tidak berubah)
    const rawgResponse = await fetch(`https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${encodeURIComponent(gameData.nama_game)}&page_size=1`);
    if (!rawgResponse.ok) {
        throw new Error(`Failed to fetch from RAWG API: ${rawgResponse.statusText}`);
    }
    const rawgData = await rawgResponse.json();
    
    const gameDetails = rawgData.results?.[0];

    const finalResult = {
      ...gameData,
      gambar_url: gameDetails?.background_image || '',
      platform: gameDetails?.platforms?.map((p: any) => p.platform.name).join(', ') || 'N/A',
      store_url: `https://rawg.io/games/${gameDetails?.slug || ''}`,
    };

    return NextResponse.json(finalResult);

  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}