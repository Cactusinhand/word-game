import React, { useState } from 'react';

interface WordInputFormProps {
  onSubmit: (word: string) => void;
  isLoading: boolean;
  providerName: string;
}

const WordInputForm: React.FC<WordInputFormProps> = ({ onSubmit, isLoading, providerName }) => {
  const [word, setWord] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (word.trim() && !isLoading) {
      onSubmit(word.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex items-center bg-slate-800 border border-slate-700 rounded-full shadow-lg overflow-hidden h-14">
        <span className="text-slate-400 pl-6 pr-3 text-base font-medium select-none shrink-0">{providerName}</span>
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Enter a word..."
          className="w-full h-full bg-transparent text-white pr-4 placeholder-slate-500 focus:outline-none text-base"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !word.trim()}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold h-full px-6 transition-colors duration-300 flex items-center justify-center"
        >
          {isLoading ? (
             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <div className="flex flex-col items-center justify-center text-sm leading-tight font-semibold">
                <span>Design</span>
                <span>Manual</span>
            </div>
          )}
        </button>
      </div>
    </form>
  );
};

export default WordInputForm;