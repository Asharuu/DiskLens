import React, { useState } from 'react';
import { 
  X, 
  History, 
  Trash2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FolderCheck, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { HistoryData, HistoryEntry } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyData: HistoryData | null;
  isLoading: boolean;
  onClearHistory: () => Promise<void>;
  onOpenExplorer: (path: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  historyData,
  isLoading,
  onClearHistory,
  onOpenExplorer
}) => {
  const [expandedSessionIds, setExpandedSessionIds] = useState<Record<string, boolean>>({});
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!isOpen) return null;

  const toggleSession = (id: string) => {
    setExpandedSessionIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      await onClearHistory();
      setShowConfirmClear(false);
    } finally {
      setIsClearing(false);
    }
  };

  const sessions = historyData?.history || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#11192e] border border-slate-700/80 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#0d1527]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Riwayat Pembersihan Storage
              </h3>
              <p className="text-xs text-slate-400">
                Catatan lengkap nama file/folder, tanggal, waktu, dan kapasitas yang dibersihkan
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {sessions.length > 0 && !showConfirmClear && (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-rose-500/30 transition flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Riwayat</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clear Confirmation Bar */}
        {showConfirmClear && (
          <div className="bg-rose-950/40 border-b border-rose-500/30 px-6 py-3 flex items-center justify-between gap-4 text-xs text-rose-300">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>Yakin ingin mereset dan menghapus seluruh catatan riwayat ini?</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleClear}
                disabled={isClearing}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold"
              >
                {isClearing ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Top All-Time Stats Banner */}
          {historyData && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-emerald-950/30 to-slate-900/80 p-3.5 rounded-2xl border border-emerald-500/30">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Total Ruang Dipulihkan
                </span>
                <span className="text-xl font-black text-emerald-400 block mt-1">
                  +{historyData.total_all_time_formatted}
                </span>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Total Sesi Pembersihan
                </span>
                <span className="text-xl font-bold text-white block mt-1">
                  {historyData.total_sessions} Sesi
                </span>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Total File Dihapus
                </span>
                <span className="text-xl font-bold text-indigo-400 block mt-1">
                  {historyData.total_files_cleaned} File
                </span>
              </div>
            </div>
          )}

          {/* Sessions List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">Memuat catatan riwayat...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <History className="w-12 h-12 stroke-[1.5] mx-auto text-slate-600" />
                <p className="text-sm font-semibold text-slate-300">Belum Ada Riwayat Pembersihan</p>
                <p className="text-xs">Setiap kali Anda membersihkan file cache atau sampah di Smart Advisor, catatannya akan otomatis tercatat di sini.</p>
              </div>
            ) : (
              sessions.map((session: HistoryEntry) => {
                const isExpanded = !!expandedSessionIds[session.id];

                return (
                  <div
                    key={session.id}
                    className="bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-slate-700 transition overflow-hidden"
                  >
                    {/* Session Summary Header */}
                    <div
                      onClick={() => toggleSession(session.id)}
                      className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-800/40 transition"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-sm font-bold text-white">
                              Pembersihan Disk
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {session.used_recycle_bin ? 'Recycle Bin' : 'Permanen'}
                            </span>
                          </div>

                          <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>{session.formatted_date}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{session.formatted_time} WIB</span>
                            </span>
                            <span>• {session.items.length} item</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Size Freed & Expand Chevron */}
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <span className="text-base font-black font-mono text-emerald-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                          +{session.total_freed_formatted}
                        </span>

                        <button className="p-1 text-slate-500 hover:text-slate-300 transition">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail List */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
                        <span className="text-[11px] font-semibold text-slate-400 block pt-1">
                          Rincian Folder / File yang Dihapus:
                        </span>

                        <div className="space-y-1.5">
                          {session.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs"
                            >
                              <div className="flex items-center space-x-2 min-w-0 flex-1 pr-2">
                                <FolderCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <span className="font-semibold text-slate-200 block truncate">
                                    {item.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500 block truncate" title={item.path}>
                                    {item.path}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <span className="font-mono text-emerald-400 font-semibold">
                                  +{item.size_freed}
                                </span>
                                <button
                                  onClick={() => onOpenExplorer(item.path)}
                                  className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition"
                                  title="Buka Lokasi di File Explorer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {session.skipped_locked_files > 0 && (
                          <span className="text-[10px] text-slate-500 italic block pt-1">
                            * {session.skipped_locked_files} file dilewati secara aman karena sedang digunakan proses aktif.
                          </span>
                        )}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d1527] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
