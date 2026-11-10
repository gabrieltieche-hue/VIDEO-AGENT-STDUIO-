import React, { useState } from 'react';
import { 
  Check, CheckSquare, MessageSquare, Scissors, 
  Sparkles, Clock, Trash2, Edit3, Paperclip, 
  ChevronDown, ChevronUp, Image as ImageIcon,
  Info, ExternalLink
} from 'lucide-react';
import { ShortProject, FeedbackItem } from '../types/studio';

interface RightSidebarProps {
  project: ShortProject;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onAddFeedback: (text: string, type?: 'comment' | 'cut' | 'idea') => void;
  onToggleResolveFeedback: (id: string, currentStatus: boolean) => void;
  onDeleteFeedback: (id: string) => void;
  onCopyPrompt: () => void;
  copiedPrompt: boolean;
  showRightPanel: boolean;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  project,
  currentTime,
  onSeek,
  onAddFeedback,
  onToggleResolveFeedback,
  onDeleteFeedback,
  onCopyPrompt,
  copiedPrompt,
  showRightPanel,
}) => {
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('resolved');
  const [activeInputTab, setActiveInputTab] = useState<'comment' | 'cut' | 'idea'>('comment');
  const [feedbackText, setFeedbackText] = useState('');
  const [showPreviousVersion, setShowPreviousVersion] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!showRightPanel) return null;

  const feedbacks = project.feedbacks || [];
  const openCount = feedbacks.filter(f => !f.resolved).length;
  const resolvedCount = feedbacks.filter(f => f.resolved).length;

  const formatCurrentTime = () => {
    const mins = Math.floor(currentTime / 60);
    const secs = (currentTime % 60).toFixed(2);
    return `${mins < 10 ? '0' : ''}${mins}:${Number(secs) < 10 ? '0' : ''}${secs}`;
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    onAddFeedback(feedbackText.trim(), activeInputTab);
    setFeedbackText('');
  };

  return (
    <aside className="w-80 bg-[#121214] border-l border-zinc-800/80 flex flex-col h-full select-none text-zinc-300 text-xs overflow-hidden shrink-0">
      
      {/* 1. Header with Filters (Matches Melvyn Screenshots: "Feedback  Open 0  Resolved 8  All 8") */}
      <div className="h-12 border-b border-zinc-800/80 px-3.5 flex items-center justify-between bg-zinc-900/40">
        <span className="font-bold text-xs text-white">Feedback</span>

        <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => setFilter('open')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              filter === 'open' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Open {openCount}
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              filter === 'resolved' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Resolved {resolvedCount}
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              filter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            All {feedbacks.length}
          </button>
        </div>
      </div>

      {/* 2. Main Feedback Body (Matches Screenshots 1, 2, 3, 4) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        
        {/* Banner for Older Version / Read Only (Screenshots 1 & 2) */}
        <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-700/80 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-zinc-300 leading-snug">
              <span>Older version (v1), read only. New feedback goes on the current version.</span>
            </div>
          </div>
          <button className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold text-white shrink-0 border border-zinc-700">
            Current version
          </button>
        </div>

        {/* Empty state for v2 (Screenshot 3 & 4) */}
        {openCount === 0 && filter === 'open' && (
          <div className="py-8 px-4 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-zinc-900 mx-auto flex items-center justify-center text-zinc-600">
              💬
            </div>
            <span className="font-bold text-xs text-white block">
              No feedback on this version (v2)
            </span>
            <p className="text-[11px] text-zinc-500 leading-relaxed max-w-xs mx-auto">
              Play the video, press <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">C</kbd> and write what you want to change. To cut, select words in the transcript (or click one word) then ✂️. Drop an image anywhere to attach it.
            </p>
          </div>
        )}

        {/* Accordion for Previous Version (Screenshots 1, 2, 3) */}
        <div>
          <button
            onClick={() => setShowPreviousVersion(!showPreviousVersion)}
            className="w-full flex items-center justify-between py-1 px-1 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200"
          >
            <div className="flex items-center gap-1.5">
              {showPreviousVersion ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              <span>Previous version • v1</span>
            </div>
            <span className="font-mono text-zinc-500">8 items</span>
          </button>

          {showPreviousVersion && (
            <div className="space-y-2.5 mt-2">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition space-y-2"
                >
                  {/* Top line: Checkbox + Tag + Timecode + Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleResolveFeedback(fb.id, fb.resolved)}
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                          fb.resolved ? 'bg-emerald-500 text-black font-bold' : 'border border-zinc-700 bg-zinc-800'
                        }`}
                      >
                        {fb.resolved && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-semibold">
                        <MessageSquare className="w-2.5 h-2.5 text-orange-400" />
                        <span>Comment</span>
                        <span 
                          onClick={() => onSeek(fb.timestamp)}
                          className="font-mono text-orange-400 hover:underline cursor-pointer"
                        >
                          {fb.timeFormatted}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <button className="hover:text-zinc-300"><Edit3 className="w-3 h-3" /></button>
                      <button onClick={() => onDeleteFeedback(fb.id)} className="hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>

                  {/* Quoted line from transcript (Melvyn Screenshots 1 & 2) */}
                  {fb.quoteText && (
                    <div className="text-[11px] font-serif italic text-zinc-500 pl-2 border-l border-zinc-700">
                      "{fb.quoteText}"
                    </div>
                  )}

                  {/* Strikethrough original user complaint */}
                  <p className="text-[11px] text-zinc-400 line-through leading-relaxed">
                    {fb.text}
                  </p>

                  {/* AI Resolution Note with Green Sparkle (Melvyn Screenshots 1 & 2) */}
                  {fb.resolutionNote && (
                    <div className="flex items-start gap-1.5 text-[11px] text-zinc-300 leading-snug pt-1">
                      <span className="text-emerald-400 shrink-0 font-bold">✨</span>
                      <span>{fb.resolutionNote}</span>
                    </div>
                  )}

                  {/* Image attachment thumbnail if present */}
                  {fb.drawingSnapshot && (
                    <div className="pt-1">
                      <img
                        src={fb.drawingSnapshot}
                        alt="Capture annotée"
                        onClick={() => setPreviewImage(fb.drawingSnapshot!)}
                        className="w-16 h-12 object-cover rounded-md border border-zinc-700 cursor-pointer hover:opacity-80"
                      />
                    </div>
                  )}

                  {/* Date footer */}
                  <div className="text-[10px] text-zinc-600 font-mono pt-1 border-t border-zinc-800/60">
                    {fb.createdAt}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Feedback Input Bar (Matches Melvyn Screenshot 4) */}
      <form onSubmit={handleAddSubmit} className="border-t border-zinc-800/80 bg-[#141417] p-2.5 space-y-2">
        {/* Sub-tabs: Comment / Cut / Ideas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveInputTab('comment')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition ${
                activeInputTab === 'comment' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <MessageSquare className="w-2.5 h-2.5 text-orange-400" />
              <span>Comment</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveInputTab('cut')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition ${
                activeInputTab === 'cut' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Scissors className="w-2.5 h-2.5 text-red-400" />
              <span>Cut</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveInputTab('idea')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition ${
                activeInputTab === 'idea' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
              <span>Ideas</span>
            </button>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
            <span>At</span>
            <Clock className="w-2.5 h-2.5 text-orange-400" />
            <span className="text-zinc-300">{formatCurrentTime()}</span>
          </div>
        </div>

        {/* Input box */}
        <textarea
          rows={2}
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Describe what you want to change..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 resize-none"
        />

        {/* Footer shortcuts & Add button */}
        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
          <div className="flex items-center gap-2">
            <span><kbd className="px-1 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">C</kbd> write</span>
            <span><kbd className="px-1 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">Enter</kbd> add</span>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="p-1 rounded text-zinc-500 hover:text-zinc-300" title="Attacher une image">
              <Paperclip className="w-3.5 h-3.5" />
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-white hover:bg-zinc-200 text-black font-bold rounded-lg transition active:scale-95 shadow-sm text-xs"
            >
              Add
            </button>
          </div>
        </div>
      </form>

      {/* Snapshot Preview modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl p-3 shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={previewImage} alt="Capture" className="w-full rounded-lg bg-black" />
          </div>
        </div>
      )}
    </aside>
  );
};
