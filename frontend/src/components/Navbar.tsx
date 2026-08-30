import React from 'react';
import { HardDrive, Sparkles, FolderTree, RefreshCw, Github, ShieldAlert, History } from 'lucide-react';
import { DriveInfo, AdvisorData } from '../types';

interface NavbarProps {
  drives: DriveInfo[];
  selectedDrive: string;
  onSelectDrive: (letter: string) => void;
  activeTab: 'advisor' | 'explorer';
  onSelectTab: (tab: 'advisor' | 'explorer') => void;
  onRefresh: () => void;
  onOpenHistory: () => void;
  isLoading: boolean;
  advisorData: AdvisorData | null;
  historyCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  drives,
  selectedDrive,
  onSelectDrive,
  activeTab,
  onSelectTab,
  onRefresh,
  onOpenHistory,
  isLoading,
  advisorData,
  historyCount = 0
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0d1527]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  DiskLens
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Smart Disk Analyzer & Cleanup Advisor</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => onSelectTab('advisor')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'advisor'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Smart Advisor</span>
              {advisorData?.summary.total_reclaimable_formatted && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  +{advisorData.summary.total_safe_formatted}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('explorer')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'explorer'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Disk Explorer</span>
            </button>
          </div>

          {/* Drive Selector & Actions */}
          <div className="flex items-center space-x-3">
            {/* Drives */}
            <div className="flex items-center space-x-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
              {drives.map((drive) => {
                const isSelected = selectedDrive === drive.letter;
                return (
                  <button
                    key={drive.letter}
                    onClick={() => onSelectDrive(drive.letter)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>Drive ({drive.letter}:)</span>
                    {drive.is_critical && (
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* History Button */}
            <button
              onClick={onOpenHistory}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/40 text-xs font-semibold transition"
              title="Lihat Riwayat Pembersihan"
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Riwayat</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com/Asharuu/DiskLens"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs transition"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
