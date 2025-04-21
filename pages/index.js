import { useState } from 'react';
import Head from 'next/head';
import { Geist, Geist_Mono } from 'next/font/google';
import React from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function Home() {
  const [theme, setTheme] = useState('');
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generateTiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate tiles');
      }

      setTiles(data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cols = ['A', 'B', 'C', 'D'];
  const rows = ['1', '2', '3', '4'];

  return (
    <div className={`${geistSans.className} min-h-screen bg-background text-foreground flex flex-col`}>
      <Head>
        <title>Chameleon Game</title>
        <meta name="description" content="Chameleon game board generator" />
      </Head>

      <main className="flex flex-col p-2 pb-8 w-full max-w-7xl mx-auto min-h-[95vh]">
        <h1 className="text-3xl font-bold mb-1 text-center chameleon-text">🦎 Chameleon Game 🦎</h1>
        
        <div className="w-full flex justify-center mb-4">
          <form onSubmit={handleSubmit} className="flex flex-col w-[300px]">
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Enter a theme (e.g., Movies, Animals, Sports)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-1 bg-white text-foreground"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full px-6 py-2 bg-accent-1 text-white rounded-lg hover:bg-accent-2 disabled:opacity-50 transition-all font-medium"
            >
              {loading ? 'Generating...' : 'Generate Tiles'}
            </button>
          </form>
        </div>

        {error && <p className="text-red-500 text-center mb-2 text-sm">{error}</p>}

        {loading ? (
          <div className="w-full flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent-3"></div>
              <p className="mt-4 text-accent-1 chameleon-text font-bold">Generating tiles...</p>
            </div>
          </div>
        ) : tiles.length > 0 && (
          <div className="w-full flex-1 flex flex-col justify-center py-2">
            <div className="grid grid-cols-[5vh_1fr_1fr_1fr_1fr] w-full max-w-6xl mx-auto gap-2 md:gap-3 h-[75vh] grid-rows-[5vh_1fr_1fr_1fr_1fr] mb-6 px-2">
              {/* Empty top-left cell */}
              <div className="w-[5vh]"></div>
              
              {/* Column headers A-D */}
              {cols.map((col) => (
                <div key={`col-${col}`} className="font-bold text-center text-2xl md:text-3xl font-mono flex items-center justify-center h-[5vh] text-accent-3">
                  {col}
                </div>
              ))}
              
              {/* Rows with row headers */}
              {rows.map((row, rowIndex) => (
                <React.Fragment key={`row-${row}`}>
                  {/* Row header */}
                  <div className="font-bold text-center text-2xl md:text-3xl font-mono flex items-center justify-center w-[5vh] text-accent-4">
                    {row}
                  </div>
                  
                  {/* Tiles for this row */}
                  {Array.from({length: 4}).map((_, colIndex) => {
                    const index = rowIndex * 4 + colIndex;
                    return (
                      <div 
                        key={`tile-${index}`} 
                        className="bg-tile-bg border border-gray-300 hover:border-accent-1 rounded-lg flex items-center justify-center overflow-hidden transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="p-2 text-center text-[2vh] sm:text-[2.5vh] md:text-[3vh] font-medium">
                          {tiles[index]}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
