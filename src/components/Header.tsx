import React from 'react';
import { 
  ChevronLeft, Copy, Check, MessageSquare, 
  Folder, Sun, Moon, MoreHorizontal, Bot, 
  Sidebar, PanelLeftClose, PanelLeftOpen, 
  PanelRightClose, PanelRightOpen, Video, 
  Radio, Sparkles, Layers, SlidersHorizontal
} from 'lucide-react';
import { ShortProject } from '../types/studio';

interface HeaderProps {
  project: ShortProject;
  activeView: 'studio' | 'recorder';
  onChangeView: (view: 'studio' | 'recorder') => void;
  onOpenChatGPTModal: () => void;
  onCopyPrompt: () => void;
  copiedPrompt: boolean;
  openFeedbacksCount: number;
  
  // Panel Toggles
  showLeftPanel: boolean;
  onToggleLeftPanel: () => void;
  showTranscript: boolean;
  onToggleTranscript: () => void;
  showTimeline: boolean;
  onToggleTimeline: () => void;
  showRightPanel: boolean;
  onToggleRightPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  activeView,
  onChangeView,
  onOpenChatGPTModal,
  onCopyPrompt,
  copiedPrompt,
  openFeedbacksCount,
  showLeftPanel,
  onToggleLeftPanel,
  showTranscript,
  onToggleTranscript,
  showTimeline,
  onToggleTimeline,
  showRightPanel,
  onToggleRightPanel,
}) => {
  return (
    <header className="h-14 bg-[#101012] border-b border-zinc-800/80 px-3.5 flex items-center justify-between select-none z-30">
      
      {/* LEFT: Back Arrow + Project Slug + Metadata Subtitle (Matches Melvyn Screenshots) */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => onChangeView(activeView === 'studio' ? 'recorder' : 'studio')}
          className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          title="Basculer de vue"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-white tracking-tight truncate font-mono">
              {project.slug}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-[11px] text-zinc-400 font-medium">Studio</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 truncate max-w-xl">
            <span>Format 9:16</span>
            <span>•</span>
            <span>1:46</span>
            <span>•</span>
            <span>Version of Oct 27, 02:30 PM</span>
            <span>•</span>
            <span className="text-orange-400">Feedback {project.currentVersion}</span>
            <span>•</span>
            <span className="truncate">Script {project.title}</span>
            <span>•</span>
            <span className="truncate">Take {project.sourceVideoName || 'Créer un monteur IA'}</span>
          </div>
        </div>
      </div>

      {/* CENTER: Main Switcher Pills (Studio vs Recorder vs MCP Hub) */}
      <div className="hidden md:flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800/80">
        <button
          onClick={() => onChangeView('studio')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
            activeView === 'studio'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-orange-400" />
          <span>Studio</span>
        </button>

        <button
          onClick={() => onChangeView('recorder')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
            activeView === 'recorder'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-red-400" />
          <span>Prompteur / Recorder</span>
        </button>

        <button
          onClick={onOpenChatGPTModal}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-950/30 transition"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <Bot className="w-3.5 h-3.5" />
          <span>ChatGPT MCP</span>
        </button>
      </div>

      {/* RIGHT: Panel Toggles + Melvyn's Copy Retours Pill + Chat Button */}
      <div className="flex items-center gap-2">
        {/* Workspace Panes Collapsing Controls */}
        <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
          <button
            onClick={onToggleLeftPanel}
            className={`p-1 rounded text-xs transition ${
              showLeftPanel ? 'text-orange-400 bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title={showLeftPanel ? 'Masquer volet gauche (Takes / Rushs)' : 'Afficher volet gauche'}
          >
            {showLeftPanel ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onToggleTranscript}
            className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition ${
              showTranscript ? 'text-orange-400 bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Afficher/Masquer colonne Transcription"
          >
            TXT
          </button>

          <button
            onClick={onToggleTimeline}
            className={`p-1 rounded text-xs transition ${
              showTimeline ? 'text-orange-400 bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Afficher/Masquer la Timeline Multi-pistes"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleRightPanel}
            className={`p-1 rounded text-xs transition ${
              showRightPanel ? 'text-orange-400 bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title={showRightPanel ? 'Masquer panneau retours' : 'Afficher panneau retours'}
          >
            {showRightPanel ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Small Utility Icons from Melvyn's UI */}
        <button className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 transition hidden sm:block">
          <Folder className="w-3.5 h-3.5" />
        </button>

        <button className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 transition hidden sm:block">
          <Sun className="w-3.5 h-3.5" />
        </button>

        {/* The Famous "Copier les retours 0" Button from Screenshots 3, 4, 8 */}
        <button
          onClick={onCopyPrompt}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-medium transition active:scale-95 shadow-sm"
          title="Copier le prompt pour Claude Code / ChatGPT"
        >
          {copiedPrompt ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Prompt copié !</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copier les retours</span>
              <span className="font-mono text-[11px] text-zinc-400 ml-0.5">
                {openFeedbacksCount}
              </span>
            </>
          )}
        </button>

        {/* "Chat" Pill Button from Top-Right of Melvyn's UI */}
        <button
          onClick={onOpenChatGPTModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-white text-xs font-semibold transition"
        >
          <MessageSquare className="w-3.5 h-3.5 text-white" />
          <span>Chat</span>
        </button>
      </div>
    </header>
  );
};
