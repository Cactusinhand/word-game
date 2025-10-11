import React, { useState, useCallback, useEffect } from 'react';
import { GameManual } from './types';
import { generateGameManual, activeProviderName } from './services/aiService';
import WordInputForm from './components/WordInputForm';
import ManualDisplay from './components/ManualDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { decodeManualFromUrl } from './utils/share';

const App: React.FC = () => {
  const [manual, setManual] = useState<GameManual | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChinese, setShowChinese] = useState(false);
  
  // This effect runs once on component mount to check for shared data in the URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('data');

    if (data) {
      setIsLoading(true);
      const decodedManual = decodeManualFromUrl(data);
      if (decodedManual) {
        setManual(decodedManual);
      } else {
        setError("Could not load the shared manual. The link might be corrupted.");
      }
      // Clean the URL to avoid re-processing on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsLoading(false);
    }
  }, []); // Empty dependency array ensures it runs only once

  const handleGenerateManual = useCallback(async (word: string) => {
    setIsLoading(true);
    setError(null);
    setManual(null);
    try {
      const result = await generateGameManual(word);
      setManual(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
      <div className="w-full max-w-4xl">
        <header className="text-center my-4 sm:my-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
            Wittgenstein's Word Game Manual
          </h1>
          {showChinese && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-300 mt-2">维特根斯坦的文字游戏手册</h2>}
          <p className="text-slate-400 mt-2 text-base sm:text-lg">
            Don't ask for the meaning, ask for the use.
          </p>
          {showChinese && <p className="text-slate-400 mt-1">不要问意义，要问用法。</p>}
        </header>

        <main className="mt-8">
          <WordInputForm 
            onSubmit={handleGenerateManual} 
            isLoading={isLoading} 
            providerName={activeProviderName}
          />
          
          <div className="mt-10">
            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {manual && <ManualDisplay manual={manual} showChinese={showChinese} setShowChinese={setShowChinese} />}
            {!isLoading && !error && !manual && (
                 <div className="text-center text-slate-500 mt-12">
                    <p>Enter a word above to generate its game manual.</p>
                    {showChinese && <p className="mt-1">在上方输入一个单词以生成其游戏手册。</p>}
                    <p className="text-sm mt-2">Discover how words are played, not just defined.</p>
                    {showChinese && <p className="text-xs mt-1">发现单词的玩法，而不仅仅是其定义。</p>}
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
