import React, { useState, useCallback, useEffect } from 'react';
import { GameManual } from './types';
import { generateGameManual, activeProviderName } from './services/secureAiService';
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
      console.log('Found encoded data in URL:', data);
      setIsLoading(true);

      try {
        const decodedManual = decodeManualFromUrl(data);
        console.log('Decoded manual:', decodedManual);

        if (decodedManual) {
          setManual(decodedManual);
        } else {
          setError("Could not load the shared manual. The link might be corrupted.");
        }
      } catch (error) {
        console.error('Error decoding shared manual:', error);
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
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 md:p-8 flex flex-col items-center justify-between">
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
          <p className="text-slate-400 mt-6 text-base sm:text-lg">
            Don't ask for the meaning, ask for the use.
          </p>
          {showChinese && <p className="text-slate-400 mt-1">不要问意义，要问用法。</p>}
        </header>

        <main className="mt-8">
          <WordInputForm
            onSubmit={handleGenerateManual}
            isLoading={isLoading}
            providerName={activeProviderName()}
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

        <footer className="mt-auto py-8 text-center text-slate-500 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm">
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/Cactusinhand/word-game"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors duration-200"
                aria-label="GitHub Repository"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>GitHub</span>
              </a>
            </div>
            <div className="flex items-center gap-2 text-slate-600">•</div>
            <div className="flex items-center gap-4">
              <span className="text-slate-400">Prompt by</span>
              <a
                href="https://x.com/lijigang_com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-cyan-400 transition-colors duration-200"
                aria-label="李继刚's Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>李继刚</span>
              </a>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-600">
            Built with React & TypeScript • Inspired by Wittgenstein's philosophy
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
