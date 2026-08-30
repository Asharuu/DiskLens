import React from 'react';
import { 
  X, 
  HelpCircle, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  ExternalLink, 
  Info, 
  AlertOctagon,
  Sparkles,
  Search,
  FolderOpen
} from 'lucide-react';
import { DirectoryExplanation } from '../types';

interface DirectoryExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: DirectoryExplanation | null;
  isLoading: boolean;
  onOpenExplorer: (path: string) => void;
  onQueryNewPath: (path: string) => void;
}

export const DirectoryExplainerModal: React.FC<DirectoryExplainerModalProps> = ({
  isOpen,
  onClose,
  explanation,
  isLoading,
  onOpenExplorer,
  onQueryNewPath
}) => {
  const [customPath, setCustomPath] = React.useState('');

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPath.trim()) {
      onQueryNewPath(customPath.trim());
    }
  };

  const isSafe = explanation?.category === 'safe';
  const isReview = explanation?.category === 'review';
  const isProtected = explanation?.category === 'protected';

  const badgeColor = isSafe
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    : isReview
    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

  const HeaderIcon = isSafe ? ShieldCheck : isReview ? AlertTriangle : ShieldAlert;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#11192e] border border-slate-700/80 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#0d1527]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Directory Intelligence & Inspector</span>
              </h3>
              <p className="text-xs text-slate-400">
                Menjawab rasa penasaran & kekhawatiran sebelum menghapus folder
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Path Query Bar */}
        <div className="px-6 pt-4 pb-2 bg-[#0e162a] border-b border-slate-800/60">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ketik atau paste path folder lain yang ingin dicek..."
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
            >
              Cek
            </button>
          </form>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                Menganalisis profil, aplikasi pembuat, dan tingkat keamanan folder...
              </p>
            </div>
          ) : !explanation ? (
            <div className="py-12 text-center text-slate-400">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold">Pilih folder untuk melihat analisisnya</p>
            </div>
          ) : (
            <>
              {/* Top Title & Safety Badge */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                      Pemilik: {explanation.owner}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1.5">
                      {explanation.title}
                    </h4>
                  </div>

                  <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeColor} flex-shrink-0`}>
                    <HeaderIcon className="w-3.5 h-3.5" />
                    <span>{explanation.safety_label}</span>
                  </span>
                </div>

                {/* Path with copy / open */}
                <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-300">
                  <span className="truncate pr-2">{explanation.path}</span>
                  <button
                    onClick={() => onOpenExplorer(explanation.path)}
                    className="flex-shrink-0 text-slate-400 hover:text-indigo-400 transition"
                    title="Buka di Windows Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 1. Ringkasan & Fungsi */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-indigo-400" />
                  <span>Apa Sebenarnya Fungsi Folder Ini?</span>
                </span>
                <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
                  <p>{explanation.summary}</p>
                  <p className="text-slate-400 font-normal mt-1">{explanation.purpose}</p>
                </div>
              </div>

              {/* 2. Dampak Jika Dihapus (Menjawab Keraguan) */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <AlertOctagon className="w-4 h-4 text-amber-400" />
                  <span>Apa yang Terjadi Jika Dihapus? (Aman / Bahaya?)</span>
                </span>
                <div className={`rounded-xl p-3.5 border text-xs leading-relaxed ${
                  isSafe
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : isProtected
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                }`}>
                  {explanation.if_deleted}
                </div>
              </div>

              {/* 3. Saran / Rekomendasi DiskLens */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Rekomendasi Tindakan</span>
                </span>
                <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {explanation.recommendation}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d1527] flex items-center justify-between">
          {explanation && (
            <button
              onClick={() => onOpenExplorer(explanation.path)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Buka di Windows Explorer</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
