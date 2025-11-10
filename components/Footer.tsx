import React from "react";

interface FooterProps {
  showChinese?: boolean;
}

const Footer: React.FC<FooterProps> = ({ showChinese = false }) => {
  return (
    <footer className="mt-auto py-8 text-center text-slate-500 border-t border-slate-800">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm mb-6">
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Cactusinhand/word-game"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-emerald-400 transition-colors duration-200"
            aria-label="GitHub Repository"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
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
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>李继刚</span>
          </a>
        </div>
      </div>

      {/* Other Tools Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-300">
          {showChinese ? "其他工具" : "Other Tools"}
        </h3>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm">
          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              {showChinese ? "工具：" : "Tools:"}
            </span>
            <a
              href="https://concept.githubcard.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-emerald-400 transition-colors duration-200"
              aria-label="Concept Three-Whys"
            >
              <span>Concept Three-Whys</span>
            </a>
          </div>
          <div className="flex items-center gap-2 text-slate-600">•</div>
          <div className="flex items-center gap-4">
            <a
              href="https://thinker.githubcard.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-cyan-400 transition-colors duration-200"
              aria-label="Roundtable Thinkers"
            >
              <span>Roundtable Thinkers</span>
            </a>
          </div>
          <div className="flex items-center gap-2 text-slate-600">•</div>
          <div className="flex items-center gap-4">
            <a
              href="https://prompt.githubcard.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-purple-400 transition-colors duration-200"
              aria-label="AI Progressive Requirement Refiner"
            >
              <span>AI Progressive Requirement Refiner</span>
            </a>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-600">
        Built with React & TypeScript • Inspired by Wittgenstein's philosophy
      </div>
    </footer>
  );
};

export default Footer;