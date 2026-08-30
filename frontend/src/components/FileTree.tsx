import React, { useState } from 'react';
import { 
  Folder, 
  File, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink, 
  Search, 
  HardDrive,
  FolderOpen,
  ArrowUpLeft,
  FileCode,
  FileVideo,
  FileAudio,
  FileArchive,
  FileText
} from 'lucide-react';
import { FileNode } from '../types';

interface FileTreeProps {
  rootNode: FileNode | null;
  isLoading: boolean;
  onNavigate: (path: string) => void;
  onOpenExplorer: (path: string) => void;
  currentPath: string;
}

const getFileIcon = (fileName: string, isDir: boolean) => {
  if (isDir) return <Folder className="w-4 h-4 text-indigo-400" />;
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mp4': case 'mkv': case 'mov': case 'avi':
      return <FileVideo className="w-4 h-4 text-purple-400" />;
    case 'mp3': case 'wav': case 'flac':
      return <FileAudio className="w-4 h-4 text-emerald-400" />;
    case 'zip': case 'rar': case '7z': case 'tar': case 'gz':
      return <FileArchive className="w-4 h-4 text-amber-400" />;
    case 'js': case 'ts': case 'py': case 'json': case 'html': case 'css': case 'dart': case 'rs':
      return <FileCode className="w-4 h-4 text-blue-400" />;
    case 'pdf': case 'doc': case 'docx': case 'txt': case 'md':
      return <FileText className="w-4 h-4 text-slate-300" />;
    default:
      return <File className="w-4 h-4 text-slate-400" />;
  }
};

export const FileTree: React.FC<FileTreeProps> = ({
  rootNode,
  isLoading,
  onNavigate,
  onOpenExplorer,
  currentPath
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});

  const toggleExpand = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPaths(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleParentNavigate = () => {
    const parts = currentPath.split('\\').filter(Boolean);
    if (parts.length > 1) {
      parts.pop();
      const parent = parts.join('\\') + (parts.length === 1 ? '\\' : '');
      onNavigate(parent);
    }
  };

  const items = rootNode?.children || [];
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#11192e]/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
      
      {/* Header / Breadcrumb / Search */}
      <div className="p-4 border-b border-slate-800 bg-[#0d1527]/90 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm overflow-x-auto py-1">
          <button
            onClick={handleParentNavigate}
            disabled={!currentPath.includes('\\') || currentPath.endsWith(':\\')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Up to Parent Directory"
          >
            <ArrowUpLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-200 font-semibold">{currentPath}</span>
          </div>

          <button
            onClick={() => onOpenExplorer(currentPath)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
            title="Open in Windows File Explorer"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Search filter */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari file atau folder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Memindai ukuran file & folder...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-2">
            <FolderOpen className="w-12 h-12 stroke-[1.5]" />
            <p className="text-sm">Tidak ada file atau folder yang ditemukan.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredItems.map((item) => {
              const isExpanded = expandedPaths[item.path];
              const pct = item.percentage || 0;

              return (
                <div key={item.path} className="rounded-xl border border-transparent hover:border-slate-800 hover:bg-slate-900/60 transition group">
                  <div
                    onClick={() => item.is_dir && onNavigate(item.path)}
                    className="flex items-center justify-between p-2.5 cursor-pointer select-none"
                  >
                    {/* Left: Icon & Name */}
                    <div className="flex items-center space-x-3 min-w-0 flex-1 pr-4">
                      {item.is_dir ? (
                        <button
                          onClick={(e) => toggleExpand(item.path, e)}
                          className="p-1 text-slate-500 hover:text-slate-200 rounded transition"
                        >
                          {item.children && item.children.length > 0 ? (
                            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                          ) : (
                            <Folder className="w-4 h-4 text-indigo-400" />
                          )}
                        </button>
                      ) : (
                        <div className="p-1">
                          {getFileIcon(item.name, false)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-slate-200 truncate group-hover:text-indigo-300 transition">
                            {item.name}
                          </span>
                          {item.is_dir && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              /
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Relative Size Bar */}
                    <div className="hidden sm:flex items-center space-x-2 w-48 mr-4">
                      <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 w-12 text-right">
                        {pct.toFixed(1)}%
                      </span>
                    </div>

                    {/* Right: Formatted Size & Action */}
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold font-mono text-slate-100 min-w-[70px] text-right">
                        {item.size_formatted}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenExplorer(item.path);
                        }}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Buka di Windows Explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Expanded children */}
                  {isExpanded && item.children && item.children.length > 0 && (
                    <div className="pl-8 pr-2 pb-2 space-y-1 border-l-2 border-indigo-500/20 ml-5 my-1">
                      {item.children.map((child) => (
                        <div
                          key={child.path}
                          onClick={() => child.is_dir && onNavigate(child.path)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer text-xs transition"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            {getFileIcon(child.name, child.is_dir)}
                            <span className="text-slate-300 truncate">{child.name}</span>
                          </div>
                          <span className="font-mono text-slate-400 font-medium">
                            {child.size_formatted}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0d1527]/60 text-xs text-slate-400 flex items-center justify-between">
        <span>Total item: {filteredItems.length}</span>
        <span>Klik folder untuk menjelajahi hierarki di dalamnya</span>
      </div>

    </div>
  );
};
