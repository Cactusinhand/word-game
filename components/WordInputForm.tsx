import React, { useState } from "react";

interface WordInputFormProps {
  onSubmit: (word: string) => void;
  isLoading: boolean;
  providerName: string;
  onToggleProvider?: () => void; // deprecated: kept for compatibility
  providers?: { id: string; name: string }[];
  selectedProviderId?: string;
  onSelectProvider?: (id: string) => void;
}

const WordInputForm: React.FC<WordInputFormProps> = ({
  onSubmit,
  isLoading,
  providerName,
  onToggleProvider,
  providers,
  selectedProviderId,
  onSelectProvider,
}) => {
  const [word, setWord] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!open) return;
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (word.trim() && !isLoading) {
      onSubmit(word.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div
        ref={containerRef}
        className="relative flex items-center bg-slate-800 border border-slate-700 rounded-full shadow-lg overflow-visible h-14"
      >
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            if (!providers || providers.length <= 1) {
              // backwards-compat: allow old toggle when no list is provided
              if (onToggleProvider) onToggleProvider();
            }
          }}
          title={"Click to choose provider"}
          className="text-slate-300 hover:text-white pl-6 pr-2 text-base font-medium shrink-0 transition-colors duration-150 focus:outline-none flex items-center gap-1"
        >
          <span>{providerName}</span>
          {((providers && providers.length > 1) ||
            !providers ||
            providers.length <= 1) && (
            <svg
              className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
        {open && (
          <div className="absolute z-20 top-14 left-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[12rem]">
            {providers && providers.length > 0 ? (
              <ul className="py-1">
                {providers.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProvider && onSelectProvider(p.id);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm ${selectedProviderId === p.id ? "bg-slate-700 text-white" : "text-slate-200 hover:bg-slate-700 hover:text-white"}`}
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="py-1">
                {[
                  { id: "glm", name: "GLM-4.5-Air" },
                  { id: "deepseek", name: "DeepSeek" },
                ].map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProvider && onSelectProvider(p.id);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm ${selectedProviderId === p.id ? "bg-slate-700 text-white" : "text-slate-200 hover:bg-slate-700 hover:text-white"}`}
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
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
