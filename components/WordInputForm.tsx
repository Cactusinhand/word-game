
import React, { useState } from 'react';

interface WordInputFormProps {
  onSubmit: (word: string) => void;
  isLoading: boolean;
}

const WordInputForm: React.FC<WordInputFormProps> = ({ onSubmit, isLoading }) => {
  const [word, setWord] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (word.trim() && !isLoading) {
      onSubmit(word.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex items-center bg-slate-800 border border-slate-700 rounded-full shadow-lg overflow-hidden">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Enter a word (e.g., ephemeral, serendipity...)"
          className="w-full bg-transparent text-white px-6 py-4 placeholder-slate-500 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !word.trim()}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-4 px-8 transition-colors duration-300"
        >
          {isLoading ? 'Designing...' : 'Design Manual'}
        </button>
      </div>
    </form>
  );
};

export default WordInputForm;
