import React, { useState } from 'react';
import { 
  Instagram, Youtube, Sparkles, Folder, Search, 
  ChevronRight, ChevronDown, Check, Info, Scissors, 
  Clock, Play, Film, MessageSquarePlus, ChevronLeft
} from 'lucide-react';
import { ShortProject, SourceVideo } from '../types/studio';

interface LeftSidebarProps {
  project: ShortProject;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onToggleCutWord: (wordId: string) => void;
  onAddCommentAtTime: (timestamp: number, textPrefix: string) => void;
  onSelectPlatform: (platform: 'instagram' | 'tiktok' | 'youtube_shorts') => void;
  sourceVideos: SourceVideo[];
  showLeftPanel: boolean;
  showTranscript: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  project,
  currentTime,
  onSeek,
  onToggleCutWord,
  onAddCommentAtTime,
  onSelectPlatform,
  sourceVideos,
  showLeftPanel,
  showTranscript,
}) => {
  const [videoSearch, setVideoSearch] = useState('');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    'Pubs': false,
    'Shorts': false,
    '2026-10-29': false,
    '2026-10-28': false,
    '2026-10-27': true
  });

  const toggleFolder = (folderName: string) => {
    setOpenFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  // Find active word in transcript
  const activeWordIndex = project.transcript.findIndex(
    w => currentTime >= w.start && currentTime <= w.end
  );

  return (
    <div className="flex h-full select-none text-zinc-300">
      
      {/* ============================================================== */}
      {/* COLUMN 1: PLATFORMS, RENDERS & VIDEOS BROWSER */}
      {/* ============================================================== */}
      {showLeftPanel && (
        <aside className="w-56 bg-[#121214] border-r border-zinc-800/80 flex flex-col h-full text-xs overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-2.5 space-y-4 custom-scrollbar">
            
            {/* 1. Platforms (Matches Screenshot 3, 4, 8) */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1.5 px-1">
                <span>Platforms</span>
                <span className="font-mono text-zinc-500">3</span>
              </div>

              <div className="space-y-1">
                {/* Insta */}
                <button
                  onClick={() => onSelectPlatform('instagram')}
                  className={`w-full text-left p-2 rounded-xl transition flex items-center justify-between ${
                    project.platform === 'instagram'
                      ? 'bg-zinc-800/90 border border-zinc-700/80 text-white'
                      : 'hover:bg-zinc-800/50 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                      IG
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-xs text-zinc-200">v2 • Insta</span>
                      <span className="text-[10px] text-zinc-500">Oct 27, 02:30 PM</span>
                    </div>
                  </div>
                  {project.platform === 'instagram' && (
                    <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-[10px] font-mono text-zinc-200">
                      Here
                    </span>
                  )}
                </button>

                {/* TikTok */}
                <button
                  onClick={() => onSelectPlatform('tiktok')}
                  className={`w-full text-left p-2 rounded-xl transition flex items-center justify-between ${
                    project.platform === 'tiktok'
                      ? 'bg-zinc-800/90 border border-zinc-700/80 text-white'
                      : 'hover:bg-zinc-800/50 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-cyan-600 flex items-center justify-center text-[10px] font-black text-white">
                      TT
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-xs text-zinc-200">v2 • TikTok</span>
                      <span className="text-[10px] text-zinc-500">Oct 27, 02:57 PM</span>
                    </div>
                  </div>
                </button>

                {/* Shorts */}
                <button
                  onClick={() => onSelectPlatform('youtube_shorts')}
                  className={`w-full text-left p-2 rounded-xl transition flex items-center justify-between ${
                    project.platform === 'youtube_shorts'
                      ? 'bg-zinc-800/90 border border-zinc-700/80 text-white'
                      : 'hover:bg-zinc-800/50 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center text-[10px] font-black text-white">
                      YT
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-xs text-zinc-200">v2 • Short</span>
                      <span className="text-[10px] text-zinc-500">Oct 27, 02:57 PM</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Renders • Insta */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1.5 px-1">
                <span>Renders • Insta</span>
                <span className="font-mono text-zinc-500">2</span>
              </div>

              <div className="space-y-1">
                <div className="p-2 rounded-xl bg-zinc-800/70 border border-zinc-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-8 rounded bg-zinc-900 border border-zinc-700 overflow-hidden flex items-center justify-center text-[9px] font-mono text-orange-400">
                      9:16
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-white">v2</span>
                      <span className="text-[10px] text-zinc-500">Oct 27, 02:30 PM ...</span>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-[10px] font-mono text-emerald-400">
                    Current
                  </span>
                </div>

                <div className="p-2 rounded-xl hover:bg-zinc-800/40 text-zinc-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-8 rounded bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center text-[9px] font-mono text-zinc-500">
                      9:16
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-xs text-zinc-300">v1</span>
                      <span className="text-[10px] text-zinc-500">Oct 27, 01:32 PM • all done</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Videos Library (Folders & Rushs) */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1.5 px-1">
                <span>Videos</span>
                <span className="font-mono text-zinc-500">420</span>
              </div>

              {/* Search Bar */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={videoSearch}
                  onChange={(e) => setVideoSearch(e.target.value)}
                  placeholder="Search videos"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-2 py-1 text-[11px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                />
              </div>

              {/* Folders */}
              <div className="space-y-1">
                {[
                  { name: 'Pubs', count: 68 },
                  { name: 'Shorts', count: 182 },
                  { name: '2026-10-29', count: 2 },
                  { name: '2026-10-28', count: 7 },
                  { name: '2026-10-27', count: 4 },
                ].map((f) => (
                  <div key={f.name}>
                    <button
                      onClick={() => toggleFolder(f.name)}
                      className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-zinc-800/50 text-[11px] text-zinc-400 hover:text-zinc-200 transition"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Folder className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{f.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{f.count}</span>
                    </button>

                    {/* Sub-items for open folders */}
                    {openFolders[f.name] && f.name === '2026-10-27' && (
                      <div className="pl-4 pr-1 py-1 space-y-1">
                        <div className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700 flex items-center gap-2">
                          <div className="w-5 h-7 rounded bg-zinc-950 overflow-hidden flex items-center justify-center text-[8px] text-orange-400">
                            ▶
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="text-[11px] font-medium text-white truncate">
                              short-monteur-ia-cl...
                            </span>
                            <span className="text-[9px] text-zinc-500">v2</span>
                          </div>
                        </div>

                        <div className="p-1.5 rounded-lg hover:bg-zinc-800/50 flex items-center gap-2">
                          <div className="w-5 h-7 rounded bg-zinc-950 overflow-hidden flex items-center justify-center text-[8px] text-zinc-500">
                            ▶
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="text-[11px] font-medium text-zinc-300 truncate">
                              short-prompts-anth...
                            </span>
                            <span className="text-[9px] text-zinc-500">v1</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ============================================================== */}
      {/* COLUMN 2: TRANSCRIPT (With Crisp Active Word Pill like Melvyn) */}
      {/* ============================================================== */}
      {showTranscript && (
        <aside className="w-64 bg-[#111113] border-r border-zinc-800/80 flex flex-col h-full text-xs overflow-hidden">
          {/* Header with info icon */}
          <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between text-zinc-300">
            <span className="font-bold text-xs">Transcript</span>
            <button className="text-zinc-500 hover:text-zinc-300" title="Informations de transcription Whisper">
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Transcript Paragraph with Spoken Word Highlight Pill */}
          <div className="flex-1 overflow-y-auto p-4 leading-relaxed custom-scrollbar">
            {project.transcript && project.transcript.length > 0 ? (
              <div className="text-sm font-normal text-zinc-300 tracking-normal space-x-1">
                {project.transcript.map((item, idx) => {
                  const isActive = activeWordIndex === idx;
                  const isCut = item.isCut;

                  return (
                    <span
                      key={item.id}
                      onClick={() => onSeek(item.start)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onToggleCutWord(item.id);
                      }}
                      onDoubleClick={() => onAddCommentAtTime(item.start, `Retouche mot "${item.word}"`)}
                      className={`inline-block cursor-pointer transition select-none my-0.5 ${
                        isCut
                          ? 'line-through text-zinc-600 bg-red-950/20'
                          : isActive
                          ? 'bg-white text-black font-bold px-1.5 py-0.2 rounded-md shadow-md scale-105 mx-0.5'
                          : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded px-0.5'
                      }`}
                      title={`[${item.start.toFixed(2)}s] Clic: Sauter | Double-clic: Commenter`}
                    >
                      {item.word}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="h-60 flex flex-col items-center justify-center text-center p-4 text-zinc-500">
                <span className="font-bold text-zinc-400 text-xs mb-1">No transcript</span>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  No transcript for this short (older version: the transcript follows the current edit). Feedback keeps its times.
                </p>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};
