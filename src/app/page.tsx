'use client';

import { useState } from 'react';
import Image from 'next/image';

// Tipe untuk satu objek game
interface Result {
  nama_game: string;
  platform: string;
  ringkasan: string;
  gambar_url: string;
  store_url: string;
  tips: string[];
}

export default function HomePage() {
  // State untuk menyimpan input dari form
  const [mood, setMood] = useState<string>('Relaxed & Creative');
  const [genre, setGenre] = useState<string>('Simulation');
  const [inspiration, setInspiration] = useState<string>('');

  // State untuk loading dan hasil (sekarang berupa array)
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Result[] | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setResults(null); // Mengosongkan hasil sebelumnya

    try {
      const response = await fetch('/api/find-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, genre, inspiration }),
      });

      if (!response.ok) {
        throw new Error('Gagal mendapatkan rekomendasi dari server');
      }

      // Data yang diterima sekarang adalah array dari objek Result
      const data: Result[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      // Anda bisa menambahkan state untuk menampilkan pesan error di UI
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-[#1a1c20] text-white font-mono">
      <div className="w-full max-w-2xl">
        <h1 className="text-5xl font-bold text-center mb-2 uppercase tracking-widest">
          Game Matcher
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Let AI find the perfect game for your mood and preferences!
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-[#2a2d34] border-4 border-black p-6 rounded-xl shadow-[8px_8px_0px_0px_black]"
        >
          <div>
            <label htmlFor="mood" className="block mb-2 text-sm font-bold">
              Game Mood
            </label>
            <select
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full p-3 border-2 border-black bg-[#1e1f23] text-white rounded-md shadow-[4px_4px_0px_0px_black] cursor-pointer"
            >
              <option>Relaxed & Creative</option>
              <option>Action-Packed & Fast</option>
              <option>Challenging & Thought-Provoking</option>
              <option>Story-Driven & Emotional</option>
              <option>Fun & Competitive</option>
              <option>Adventure & Exploration</option>
              <option>Relaksasi & Meditasi</option>
              <option>Multiplayer & Sosial</option>
              <option>Retro & Nostalgia</option>
            </select>
          </div>

          <div>
            <label htmlFor="genre" className="block mb-2 text-sm font-bold">
              Favorite Genre
            </label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full p-3 border-2 border-black bg-[#1e1f23] text-white rounded-md shadow-[4px_4px_0px_0px_black] cursor-pointer"
            >
              <option>Simulation</option>
              <option>RPG</option>
              <option>Strategy</option>
              <option>Shooter</option>
              <option>Adventure</option>
              <option>Action</option>
              <option>Anime</option>
              <option>Indie</option>
              <option>Horror</option>
              <option>Multiplayer Online</option>
              <option>Sports</option>
              <option>Cards & Board</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="inspiration"
              className="block mb-2 text-sm font-bold"
            >
              Similar to... (Opsional)
            </label>
            <input
              type="text"
              id="inspiration"
              value={inspiration}
              onChange={(e) => setInspiration(e.target.value)}
              className="w-full p-3 border-2 border-black bg-[#1e1f23] text-white rounded-md shadow-[4px_4px_0px_0px_black]"
              placeholder="Contoh: Stardew Valley"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff6600] text-white font-bold text-lg py-3 px-6 border-4 border-black shadow-[4px_4px_0_#000000,8px_8px_0_#000000] hover:bg-[#ff7f00] hover:shadow-[2px_2px_0_#000000,4px_4px_0_#000000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all cursor-pointer"
          >
            {loading ? 'Searching...' : 'Find My Game'}
          </button>
        </form>

        {loading && (
          <p className="text-center mt-8 font-bold text-gray-300">
            AI is matching games for you...
          </p>
        )}

        {/* Tampilkan hasil jika ada */}
        {results && results.length > 0 && (
          <div className="mt-10 space-y-8">
            {results.map((result, index) => (
              <div key={index} className="p-6 bg-[#2f323a] border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_black]">
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={result.gambar_url}
                    alt={result.nama_game}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover rounded-md border-2 border-black"
                  />
                </div>
                <h2 className="text-2xl font-bold">{result.nama_game}</h2>
                <p className="text-sm text-gray-400 mb-4">{result.platform}</p>
                <p className="mb-4">
                  <strong className="text-orange-400">
                    Why AI recommends this:
                  </strong>{' '}
                  {result.ringkasan}
                </p>
                <a
                  href={result.store_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold border-4 border-black rounded-md px-5 py-2.5 shadow-[4px_4px_0px_0px_black]"
                >
                  🎮 See in Store
                </a>
                <div className="mt-4">
                  <h3 className="font-bold mb-2">💡 Getting Started Tips:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {result.tips.map((tip, tipIndex) => (
                      <li key={tipIndex}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
