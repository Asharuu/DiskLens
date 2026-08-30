import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  CheckCircle2, 
  FolderSync,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  HardDrive,
  Check
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
  const [cleanProgress, setCleanProgress] = useState(0);
  const [cleanStageText, setCleanStageText] = useState('Menyiapkan proses pembersihan...');
  
  const [isEmptyingBin, setIsEmptyingBin] = useState(false);
  const [binEmptiedMessage, setBinEmptiedMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CleanResult | null>(null);

  const totalBytes = itemsToClean.reduce((acc, item) => acc + item.total_bytes, 0);
  const allPaths = itemsToClean.flatMap(item => item.paths);

  // Animated progress bar during cleaning
  useEffect(() => {
    if (isCleaning) {
      setCleanProgress(15);
      setCleanStageText('Memeriksa izin akses file & mendeteksi cache...');
      
      const t1 = setTimeout(() => {
        setCleanProgress(45);
        setCleanStageText(`Menghapus direktori sampah & cache (${allPaths.length} target)...`);
      }, 400);

      const t2 = setTimeout(() => {
        setCleanProgress(85);
        setCleanStageText('Menghitung ruang yang berhasil dipulihkan & mencatat riwayat...');
      }, 1000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setCleanProgress(0);
    }
  }, [isCleaning, allPaths.length]);

  if (!isOpen) return null;

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
      setCleanProgress(100);
      setCleanStageText('Pembersihan selesai!');
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
      setBinEmptiedMessage("✅ Recycle Bin berhasil dikosongkan! Kapasitas disk fisik bertambah.");
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
                {result ? 'Pembersihan Selesai' : isCleaning ? 'Sedang Memproses Pembersihan' : 'Konfirmasi Pembersihan Ruang'}
              </h3>
              <p className="text-xs text-slate-400">
                {result 
                  ? 'Laporan hasil pemulihan disk & status Recycle Bin' 
                  : isCleaning 
                  ? 'Mohon tunggu, proses penghapusan sedang berlangsung...'
                  : `${itemsToClean.length} kategori sampah dipilih`}
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
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Ruang Penyimpanan Berhasil Dipulihkan
                </span>
                <span className="text-3xl font-black text-emerald-400 mt-1 block font-mono">
                  +{result.total_freed_formatted}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left pt-1">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">File & Folder Dihapus</span>
                  <span className="text-sm font-bold text-slate-200">{result.total_deleted_files} item</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Metode Penghapusan</span>
                  <span className="text-sm font-bold text-indigo-400">
                    {result.used_recycle_bin ? 'Recycle Bin' : 'Permanen (Langsung Lega)'}
                  </span>
                </div>
              </div>

              {/* Recycle Bin Explanation & Quick Empty Action */}
              {result.used_recycle_bin ? (
                <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 text-left space-y-3">
                  <div className="flex items-start space-x-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-300">Kapasitas Belum Terlihat Bertambah?</h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        Anda menggunakan opsi <strong>Recycle Bin</strong>. Di Windows, file masih tersimpan di folder tempat sampah. Ruang disk fisik Anda baru akan lega secara penuh setelah Recycle Bin dikosongkan.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleEmptyRecycleBin}
                    disabled={isEmptyingBin}
                    className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isEmptyingBin ? 'animate-spin' : ''}`} />
                    <span>{binEmptiedMessage || 'Kosongkan Recycle Bin Sekarang (+ Lega)'}</span>
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3.5 text-left flex items-start space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-emerald-300">
                    <strong>Kapasitas Langsung Bertambah:</strong> File sampah telah dihapus secara permanen dari drive tanpa tertahan di Recycle Bin.
                  </span>
                </div>
              )}

              {/* Locked files disclaimer */}
              {result.total_skipped_locked_files > 0 && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-left flex items-start space-x-2 text-xs text-slate-400">
                  <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    <strong>Catatan:</strong> Terdapat {result.total_skipped_locked_files} file cache yang sedang dikunci oleh browser aktif (seperti Chrome/Edge). Tutup browser tersebut lalu bersihkan lagi untuk menghapus sisanya.
                  </span>
                </div>
              )}
            </div>
          ) : isCleaning ? (
            /* Live Progress & Loading Screen */
            <div className="py-8 px-2 space-y-6 text-center">
              
              {/* Animated Radar Pulse */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 relative z-10">
                  <HardDrive className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              {/* Live Stage Info */}
              <div className="space-y-2">
                <h4 className="text-base font-bold text-white">
                  Sedang Membersihkan Storage...
                </h4>
                <p className="text-xs text-indigo-300 font-medium">
                  {cleanStageText}
                </p>
              </div>

              {/* Animated Progress Bar */}
              <div className="space-y-1.5 max-w-sm mx-auto">
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${cleanProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Memproses berkas</span>
                  <span>{cleanProgress}%</span>
                </div>
              </div>

              {/* Real-time Loading Awareness Note */}
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80 text-[11px] text-slate-400 max-w-sm mx-auto text-left flex items-start space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  {useRecycleBin 
                    ? "Opsi Recycle Bin aktif: File akan dipindahkan ke tempat sampah sebelum dikosongkan."
                    : "Opsi Permanen aktif: Ruang disk C Anda akan langsung bertambah seketika setelah bar selesai."
                  }
                </span>
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
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 max-h-36 overflow-y-auto space-y-2">
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
              Selesai & Perbarui Tampilan
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
