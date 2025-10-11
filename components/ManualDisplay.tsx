import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { GameManual, BilingualString } from '../types';
import { TargetIcon, ChessBoardIcon, WrenchScrewdriverIcon, ExclamationTriangleIcon, KeyIcon, DownloadIcon, ShareIcon } from './icons';
import { encodeManualForUrl } from '../utils/share';


interface ManualCardProps {
  title: BilingualString;
  icon: React.ReactNode;
  children: React.ReactNode;
  showChinese: boolean;
}

const ManualCard: React.FC<ManualCardProps> = ({ title, icon, children, showChinese }) => (
  <div className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg p-6 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/50 hover:bg-slate-800">
    <div className="flex items-center mb-4">
      <div className="text-emerald-400 mr-3">{icon}</div>
      <div>
        <h3 className="text-xl font-bold text-emerald-400">{title.en}</h3>
        {showChinese && <h4 className="text-lg font-semibold text-cyan-400 mt-1">{title.zh}</h4>}
      </div>
    </div>
    <div className="text-slate-300 space-y-4">{children}</div>
  </div>
);

interface ManualDisplayProps {
  manual: GameManual;
  showChinese: boolean;
  setShowChinese: (show: boolean) => void;
}

const ManualDisplay: React.FC<ManualDisplayProps> = ({ manual, showChinese, setShowChinese }) => {
  const manualRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleDownloadImage = async () => {
    const element = manualRef.current;
    if (!element) return;
    
    setIsCapturing(true);

    try {
        const canvas = await html2canvas(element, {
            backgroundColor: '#0f172a', // Corresponds to slate-900
            scale: 2, // For higher resolution
            useCORS: true,
            logging: false,
        });

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `wittgenstein-manual-${manual.targetWord.en.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Failed to capture image:", error);
    } finally {
        setIsCapturing(false);
    }
  };

  const handleShareLink = () => {
    if (isCopied) return;
    const encodedData = encodeManualForUrl(manual);
    // Assuming the app is hosted at the root. For other paths, window.location.pathname should be used.
    const url = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
    navigator.clipboard.writeText(url).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500); // Reset after 2.5 seconds
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
       <div className="flex justify-center items-center flex-wrap gap-4 mb-8">
        <label htmlFor="bilingual-toggle" className="flex items-center cursor-pointer">
          <span className="mr-3 text-sm text-slate-400 font-medium">Show Chinese Translation</span>
          <div className="relative">
            <input
              type="checkbox"
              id="bilingual-toggle"
              className="sr-only"
              checked={showChinese}
              onChange={() => setShowChinese(!showChinese)}
            />
            <div className="block bg-slate-700 w-14 h-8 rounded-full"></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${showChinese ? 'transform translate-x-6 bg-emerald-400' : ''}`}></div>
          </div>
        </label>
        <button
          onClick={handleDownloadImage}
          disabled={isCapturing}
          className="flex items-center gap-2 bg-slate-700 hover:bg-emerald-500 disabled:bg-slate-600 text-white font-semibold py-2 px-5 rounded-full transition-all duration-300 text-sm shadow-lg"
          aria-label="Download manual as image"
        >
          <DownloadIcon />
          <span>{isCapturing ? 'Capturing...' : 'Download Image'}</span>
        </button>
        <button
          onClick={handleShareLink}
          className="flex items-center gap-2 bg-slate-700 hover:bg-cyan-500 text-white font-semibold py-2 px-5 rounded-full transition-all duration-300 text-sm shadow-lg"
          aria-label="Copy share link"
        >
          <ShareIcon />
          <span>{isCopied ? 'Link Copied!' : 'Copy Link'}</span>
        </button>
      </div>

      <div ref={manualRef} className="space-y-6 bg-slate-900 p-4 sm:p-8">
        <header className="text-center mb-10">
          <h2 className="text-5xl font-extrabold text-white">
            Game Manual: <span className="text-emerald-400 capitalize">{manual.targetWord.en}</span>
          </h2>
          {showChinese && <h3 className="text-4xl font-bold text-cyan-400 mt-2">游戏手册: <span className="capitalize">{manual.targetWord.zh}</span></h3>}
          <p className="text-slate-400 mt-4">Your guide to mastering the language game.</p>
          {showChinese && <p className="text-slate-400 mt-1">你掌握语言游戏的向导。</p>}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
              <ManualCard title={manual.coreGame.title} icon={<TargetIcon />} showChinese={showChinese}>
                  <p className="text-lg italic">{manual.coreGame.description.en}</p>
                  {showChinese && <p className="text-md italic text-slate-400 mt-1">{manual.coreGame.description.zh}</p>}
              </ManualCard>
          </div>
          
          <ManualCard title={manual.gameBoards.title} icon={<ChessBoardIcon />} showChinese={showChinese}>
              <div>
                  <h4 className="font-semibold text-slate-100">{manual.gameBoards.boardA.name.en}</h4>
                  {showChinese && <h5 className="font-semibold text-cyan-200">{manual.gameBoards.boardA.name.zh}</h5>}
                  <p className="italic">"{manual.gameBoards.boardA.usage.en}"</p>
                  {showChinese && <p className="italic text-slate-400 mt-1">"{manual.gameBoards.boardA.usage.zh}"</p>}
              </div>
              <div>
                  <h4 className="font-semibold text-slate-100">{manual.gameBoards.boardB.name.en}</h4>
                  {showChinese && <h5 className="font-semibold text-cyan-200">{manual.gameBoards.boardB.name.zh}</h5>}
                  <p className="italic">"{manual.gameBoards.boardB.usage.en}"</p>
                  {showChinese && <p className="italic text-slate-400 mt-1">"{manual.gameBoards.boardB.usage.zh}"</p>}
              </div>
          </ManualCard>
          
          <ManualCard title={manual.originAndTeardown.title} icon={<WrenchScrewdriverIcon />} showChinese={showChinese}>
              <div>
                  <h4 className="font-semibold text-slate-100">Card Teardown</h4>
                  {showChinese && <h5 className="font-semibold text-cyan-200">卡牌拆解</h5>}
                  <p>{manual.originAndTeardown.teardown.en}</p>
                  {showChinese && <p className="text-slate-400 mt-1">{manual.originAndTeardown.teardown.zh}</p>}
              </div>
               <div>
                  <h4 className="font-semibold text-slate-100">Assembly Story</h4>
                  {showChinese && <h5 className="font-semibold text-cyan-200">组装故事</h5>}
                  <p>{manual.originAndTeardown.story.en}</p>
                  {showChinese && <p className="text-slate-400 mt-1">{manual.originAndTeardown.story.zh}</p>}
              </div>
          </ManualCard>

          <ManualCard title={manual.foulWarning.title} icon={<ExclamationTriangleIcon />} showChinese={showChinese}>
              <p>{manual.foulWarning.description.en}</p>
              {showChinese && <p className="text-slate-400 mt-1">{manual.foulWarning.description.zh}</p>}
          </ManualCard>

          <ManualCard title={manual.masteryTip.title} icon={<KeyIcon />} showChinese={showChinese}>
              <p className="font-medium text-lg">{manual.masteryTip.description.en}</p>
              {showChinese && <p className="font-medium text-md text-slate-400 mt-1">{manual.masteryTip.description.zh}</p>}
          </ManualCard>
        </div>
      </div>
    </div>
  );
};

export default ManualDisplay;