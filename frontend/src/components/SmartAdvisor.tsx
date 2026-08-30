import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Trash2, 
  ExternalLink, 
  CheckSquare, 
  Square,
  Info,
  CheckCircle2,
  Lock,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AdvisorData, RecommendationItem } from '../types';

interface SmartAdvisorProps {
  advisorData: AdvisorData | null;
  isLoading: boolean;
  onOpenCleanModal: (selectedItems: RecommendationItem[]) => void;
  onOpenExplorer: (path: string) => void;
  onExplainPath: (path: string) => void;
}

export const SmartAdvisor: React.FC<SmartAdvisorProps> = ({
  advisorData,
  isLoading,
  onOpenCleanModal,
  onOpenExplorer,
  onExplainPath
}) => {
  const [activeZone, setActiveZone] = useState<'safe' | 'review' | 'protected'>('safe');
  const [selectedItemIds, setSelectedItemIds] = useState<Record<string, boolean>>({});
  const [expandedPathsMap, setExpandedPathsMap] = useState<Record<string, boolean>>({});

  // Initialize default selected items when advisorData loads
  React.useEffect(() => {
    if (advisorData) {
      const initial: Record<string, boolean> = {};
      advisorData.recommendations.safe.forEach(item => {
        initial[item.id] = true;
      });
      setSelectedItemIds(initial);
    }
  }, [advisorData]);

  if (isLoading) {
    return (
      <div className="bg-[#11192e]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-12 flex flex-col items-center justify-center space-y-4 shadow-xl">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-300">
          Smart Advisor sedang menganalisis file cache, profil lama, dan sampah sistem...
        </p>
        <span className="text-xs text-slate-500">Mengkategorikan tingkat keamanan data...</span>
      </div>
    );
  }

  if (!advisorData) return null;

  const currentItems = advisorData.recommendations[activeZone] || [];

  const toggleSelect = (id: string) => {
    setSelectedItemIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAllSafe = () => {
    const updated = { ...selectedItemIds };
    advisorData.recommendations.safe.forEach(item => {
      updated[item.id] = true;
    });
    setSelectedItemIds(updated);
  };

  const handleDeselectAll = () => {
    setSelectedItemIds({});
  };

  // Calculate selected total bytes
  const allAvailableItems = [
    ...advisorData.recommendations.safe,
    ...advisorData.recommendations.review
  ];
  
  const selectedItems = allAvailableItems.filter(item => selectedItemIds[item.id]);
  const totalSelectedBytes = selectedItems.reduce((acc, item) => acc + item.total_bytes, 0);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="space-y-6">

      {/* Hero Overview Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 rounded-2xl border border-indigo-500/30 p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">
                Rekomendasi Cerdas: &ldquo;Better Hapus yang Mana?&rdquo;
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Algoritma Smart Advisor otomatis mendeteksi cache browser, sisa paket update, profil lama, dan file sementara tanpa membahayakan integritas sistem operasi Windows Anda.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 self-start md:self-auto">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Total Potensi Ruang Pulih
              </span>
              <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent block mt-0.5">
                {advisorData.summary.total_reclaimable_formatted}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Safety Zone Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Tab Buttons */}
        <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          
          {/* Safe Zone */}
          <button
            onClick={() => setActiveZone('safe')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeZone === 'safe'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zona Hijau (Safe to Delete)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] font-mono text-emerald-300">
              {advisorData.summary.total_safe_formatted}
            </span>
          </button>

          {/* Review Zone */}
          <button
            onClick={() => setActiveZone('review')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeZone === 'review'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Zona Kuning (Review Needed)</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-mono text-amber-300">
              {advisorData.summary.total_review_formatted}
            </span>
          </button>

          {/* Protected Zone */}
          <button
            onClick={() => setActiveZone('protected')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeZone === 'protected'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Zona Merah (Protected)</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-[10px] font-mono text-rose-300">
              Locked
            </span>
          </button>

        </div>

        {/* Quick Selection Helpers */}
        {activeZone !== 'protected' && (
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={handleSelectAllSafe}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Pilih Semua Zona Hijau
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              Batal Pilih
            </button>
          </div>
        )}

      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {currentItems.length === 0 ? (
          <div className="bg-[#11192e]/90 rounded-2xl border border-slate-800 p-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-200">Tidak ada item di kategori ini!</p>
            <p className="text-xs text-slate-500">Penyimpanan Anda sudah bersih untuk kategori ini.</p>
          </div>
        ) : (
          currentItems.map((item) => {
            const isSelected = !!selectedItemIds[item.id];
            const isProtected = item.category === 'protected';

            return (
              <div
                key={item.id}
                onClick={() => !isProtected && toggleSelect(item.id)}
                className={`rounded-2xl border p-5 transition-all duration-200 ${
                  isProtected
                    ? 'bg-rose-950/20 border-rose-900/40 opacity-90'
                    : isSelected
                    ? 'bg-slate-900/90 border-indigo-500/60 shadow-lg shadow-indigo-950/30 cursor-pointer'
                    : 'bg-[#11192e]/80 border-slate-800 hover:border-slate-700 cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    
                    {/* Checkbox / Lock Icon */}
                    <div className="pt-0.5">
                      {isProtected ? (
                        <div className="p-1 text-rose-400" title="File sistem terkunci">
                          <Lock className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="p-1 text-indigo-400 hover:text-indigo-300 transition">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 fill-indigo-600 text-white" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      
                      {/* App tag & Title */}
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                          {item.app}
                        </span>
                        <h3 className="text-sm font-bold text-white">
                          {item.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Impact / Result note */}
                      <div className="flex items-start space-x-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-400">
                          <strong className="text-slate-200">Dampak pembersihan:</strong> {item.impact}
                        </span>
                      </div>

                      {/* Target Paths list */}
                      {item.paths && item.paths.length > 0 && (
                        <div className="space-y-1.5 pt-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {(expandedPathsMap[item.id] ? item.paths : item.paths.slice(0, 2)).map((p, idx) => (
                              <div
                                key={idx}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-slate-300 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 transition group/chip"
                              >
                                <span className="truncate max-w-[240px] sm:max-w-[320px]" title={p}>
                                  {p}
                                </span>

                                <div className="flex items-center space-x-1 pl-1 border-l border-slate-800">
                                  {/* Info / Tanya Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onExplainPath(p);
                                    }}
                                    className="p-1 rounded text-indigo-400 hover:text-indigo-300 hover:bg-indigo-600/20 transition"
                                    title="Tanya: Ini direktori apa & apa fungsinya?"
                                  >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Open Explorer Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenExplorer(p);
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                    title="Buka di Windows File Explorer"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Expand / Collapse Toggle for Hidden Folders */}
                          {item.paths.length > 2 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedPathsMap(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                              }}
                              className="inline-flex items-center space-x-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-md border border-indigo-500/20 transition"
                            >
                              {expandedPathsMap[item.id] ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                  <span>Sembunyikan folder</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                  <span>+{item.paths.length - 2} folder lainnya (Klik untuk lihat & cek semua)</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Right: Size Badge & Safety Indicator */}
                  <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                    <span className="text-base font-black font-mono text-white bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 shadow-inner">
                      {item.total_formatted}
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.safety_score >= 90
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : item.safety_score >= 70
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}>
                      {item.safety_score > 0 ? `Keamanan: ${item.safety_score}%` : 'Sistem Utama'}
                    </span>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Sticky Action Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-indigo-500/50 rounded-2xl p-4 shadow-2xl shadow-indigo-950/80 flex items-center justify-between gap-4">
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">
                  {selectedItems.length} item dipilih untuk dibersihkan
                </span>
                <span className="text-base font-bold text-emerald-400 block">
                  +{formatSize(totalSelectedBytes)} Ruang Kosong Siap Dipulihkan
                </span>
              </div>
            </div>

            <button
              onClick={() => onOpenCleanModal(selectedItems)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Bersihkan Sekarang</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
