import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  FolderSync,
  AlertTriangle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { RecommendationItem, CleanResult } from '../types';

interface CleanModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemsToClean: RecommendationItem[];
  onConfirmClean: (paths: string[], useRecycleBin: boolean) => Promise<CleanResult | null>;
  onCleanupCompleted: () => void;
}

export const CleanModal: React.FC<CleanModalProps> = ({
  isOpen,
  onClose,
  itemsToClean,
  onConfirmClean,
  onCleanupCompleted
}) => {
  // Default to permanent false = instant space recovery
  const [useRecycleBin, setUseRecycleBin] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isEmptyingBin, setIsEmptyingBin] = useState(false);
  const [binEmptiedMessage, setBinEmptiedMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CleanResult | null>(null);

  if (!isOpen) return null;

  const totalBytes = itemsToClean.reduce((acc, item) => acc + item.total_bytes, 0);
  const allPaths = itemsToClean.flatMap(item => item.paths);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleStartClean = async () => {
    setIsCleaning(true);
    try {
      const res = await onConfirmClean(allPaths, useRecycleBin);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleEmptyRecycleBin = async () => {
    setIsEmptyingBin(true);
    try {
      await fetch('/api/empty-recycle-bin', { method: 'POST' });
      setBinEmptiedMessage("Recycle Bin berhasil dikosongkan!");
      onCleanupCompleted();
    } catch (e) {
      console.error(e);
    } finally {
      setIsEmptyingBin(false);
    }
  };

  const handleFinish = () => {
    setResult(null);
    setBinEmptiedMessage(null);
    onCleanupCompleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#11192e] border border-slate-700/80 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#0d1527]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {result ? 'Pembersihan Selesai' : 'Konfirmasi Pembersihan Ruang'}
              </h3>
              <p className="text-xs text-slate-400">
                {result ? 'Laporan hasil pemulihan disk' : `${itemsToClean.length} kategori sampah dipilih`}
              </p>
            </div>
          </div>

          {!isCleaning && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {result ? (
            /* Result Screen */
            <div className="text-center space-y-4 py-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Ruang Penyimpanan Berhasil Dipulihkan
                </span>
                <span className="text-3xl font-black text-emerald-400 mt-1 block">
                  +{result.total_freed_formatted}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left pt-2">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">File Dihapus</span>
                  <span className="text-sm font-bold text-slate-200">{result.total_deleted_files} file</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Metode</span>
                  <span className="text-sm font-bold text-indigo-400">
                    {result.used_recycle_bin ? 'Recycle Bin' : 'Permanen (Langsung Lega)'}
                  </span>
                </div>
              </div>

              {result.total_skipped_locked_files > 0 && (
                <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 text-left flex items-start space-x-2 text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    <strong>Catatan:</strong> Terdapat {result.total_skipped_locked_files} file cache yang sedang dikunci oleh aplikasi aktif (seperti Chrome/Edge). Tutup aplikasi tersebut lalu klik bersihkan lagi untuk menghapus sisanya.
                  </span>
                </div>
              )}

              {result.used_recycle_bin && (
                <div className="pt-2">
                  <button
                    onClick={handleEmptyRecycleBin}
                    disabled={isEmptyingBin}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isEmptyingBin ? 'animate-spin' : ''}`} />
                    <span>{binEmptiedMessage || 'Kosongkan Recycle Bin Sekarang (+ Lega)'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : isCleaning ? (
            /* Loading Screen */
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
              <div>
                <p className="text-sm font-bold text-white">Sedang membersihkan file sampah...</p>
                <p className="text-xs text-slate-400 mt-1">
                  Menghapus file cache, shader, dan data sementara...
                </p>
              </div>
            </div>
          ) : (
            /* Selection & Options Confirmation */
            <>
              {/* Important Browser Lock Tip */}
              <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300">
                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                <span>
                  <strong>Tips Maksimal:</strong> Jika Anda membersihkan cache browser, pastikan <strong>Google Chrome & Microsoft Edge sudah ditutup</strong> agar Windows tidak mengunci file cache tersebut.
                </span>
              </div>

              {/* Selected items breakdown preview */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 max-h-40 overflow-y-auto space-y-2">
                {itemsToClean.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50 last:border-0">
                    <span className="text-slate-300 font-medium truncate max-w-[280px]">{item.title}</span>
                    <span className="text-emerald-400 font-mono font-semibold">{item.total_formatted}</span>
                  </div>
                ))}
              </div>

              {/* Total Recoverable Highlight */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs font-semibold text-slate-300">Total Ruang Akan Dipulihkan:</span>
                <span className="text-base font-black text-emerald-400 font-mono">+{formatSize(totalBytes)}</span>
              </div>

              {/* Deletion Method Radio Options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Pilihan Metode Penghapusan:</label>
                
                {/* Option 1: Permanent (Recommended for caches) */}
                <div
                  onClick={() => setUseRecycleBin(false)}
                  className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition ${
                    !useRecycleBin
                      ? 'bg-emerald-600/10 border-emerald-500/50'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Trash2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-white block">Hapus Permanen Langsung (Direkomendasikan)</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Kapasitas Disk C: langsung bertambah seketika tanpa tertahan di tempat sampah.
                    </span>
                  </div>
                </div>

                {/* Option 2: Recycle Bin (Safe) */}
                <div
                  onClick={() => setUseRecycleBin(true)}
                  className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition ${
                    useRecycleBin
                      ? 'bg-indigo-600/10 border-indigo-500/50'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <FolderSync className="w-5 h-5 text-indigo-400 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-white block">Pindahkan ke Windows Recycle Bin</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      File bisa di-restore, namun ruang disk baru bertambah setelah Recycle Bin dikosongkan.
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 bg-[#0d1527] flex items-center justify-end space-x-3">
          {result ? (
            <button
              onClick={handleFinish}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
            >
              Selesai & Perbarui Data
            </button>
          ) : !isCleaning && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
              >
                Batal
              </button>

              <button
                onClick={handleStartClean}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Mulai Bersihkan (+{formatSize(totalBytes)})</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
