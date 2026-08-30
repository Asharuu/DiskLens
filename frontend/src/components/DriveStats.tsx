import React from 'react';
import { HardDrive, AlertTriangle, CheckCircle2, Sparkles, Database } from 'lucide-react';
import { DriveInfo } from '../types';

interface DriveStatsProps {
  drive: DriveInfo | null;
  safeReclaimableFormatted?: string;
  onOpenAdvisor?: () => void;
}

export const DriveStats: React.FC<DriveStatsProps> = ({
  drive,
  safeReclaimableFormatted,
  onOpenAdvisor
}) => {
  if (!drive) return null;

  const isCritical = drive.free_percent < 10.0;
  const isWarning = drive.free_percent >= 10.0 && drive.free_percent < 25.0;

  const statusColor = isCritical
    ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    : isWarning
    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  const barColor = isCritical
    ? 'from-rose-600 via-rose-500 to-amber-500'
    : isWarning
    ? 'from-amber-600 to-yellow-500'
    : 'from-indigo-600 via-blue-500 to-emerald-500';

  return (
    <div className="bg-[#11192e]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
        isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'
      }`} />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        
        {/* Left: Drive Info & Capacity */}
        <div className="flex items-start space-x-4">
          <div className={`p-3.5 rounded-2xl border ${
            isCritical
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
          }`}>
            <HardDrive className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {drive.label} ({drive.letter}:)
              </h2>
              <span className={`inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                {isCritical ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Ruang Kritis (&lt;10%)</span>
                  </>
                ) : isWarning ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Ruang Cukup</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sehat & Aman</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              File System: NTFS • Tipe: {drive.type} • Jalur: {drive.path}
            </p>
          </div>
        </div>

        {/* Middle / Right: Storage Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 max-w-xl">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Total Kapasitas
            </span>
            <span className="text-lg font-bold text-white mt-0.5 block">
              {drive.total_formatted}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Ruang Terpakai
            </span>
            <span className="text-lg font-bold text-slate-200 mt-0.5 block">
              {drive.used_formatted} <span className="text-xs font-normal text-slate-400">({drive.used_percent}%)</span>
            </span>
          </div>

          <div className={`border rounded-xl p-3.5 col-span-2 sm:col-span-1 ${
            isCritical
              ? 'bg-rose-500/10 border-rose-500/30'
              : 'bg-emerald-500/10 border-emerald-500/30'
          }`}>
            <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider block">
              Sisa Ruang Kosong
            </span>
            <span className={`text-lg font-bold mt-0.5 block ${isCritical ? 'text-rose-400' : 'text-emerald-400'}`}>
              {drive.free_formatted} <span className="text-xs font-normal opacity-80">({drive.free_percent}%)</span>
            </span>
          </div>
        </div>

      </div>

      {/* Visual Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="text-slate-400 flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>Penggunaan Penyimpanan</span>
          </span>
          <span className="font-semibold text-slate-300">
            {drive.used_percent}% terisi • {drive.free_formatted} tersisa
          </span>
        </div>

        <div className="w-full h-3.5 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out shadow-sm`}
            style={{ width: `${Math.min(drive.used_percent, 100)}%` }}
          />
        </div>
      </div>

      {/* Recommendation banner if safe space is available */}
      {safeReclaimableFormatted && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
            <span>
              Smart Advisor mendeteksi <strong className="text-emerald-400">{safeReclaimableFormatted}</strong> file sampah/cache yang 100% aman untuk dibersihkan!
            </span>
          </div>

          {onOpenAdvisor && (
            <button
              onClick={onOpenAdvisor}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center space-x-1 shadow-md shadow-indigo-600/20"
            >
              <span>Lihat Rekomendasi</span>
              <span>→</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
};
