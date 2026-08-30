import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DriveStats } from './components/DriveStats';
import { FileTree } from './components/FileTree';
import { SmartAdvisor } from './components/SmartAdvisor';
import { CleanModal } from './components/CleanModal';
import { DriveInfo, FileNode, AdvisorData, RecommendationItem, CleanResult } from './types';

export function App() {
  const [drives, setDrives] = useState<DriveInfo[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<string>('C');
  const [activeTab, setActiveTab] = useState<'advisor' | 'explorer'>('advisor');
  
  // Data States
  const [treeData, setTreeData] = useState<FileNode | null>(null);
  const [advisorData, setAdvisorData] = useState<AdvisorData | null>(null);
  const [currentScanPath, setCurrentScanPath] = useState<string>('C:\\');
  
  // Loading States
  const [isLoadingDrives, setIsLoadingDrives] = useState<boolean>(true);
  const [isLoadingTree, setIsLoadingTree] = useState<boolean>(false);
  const [isLoadingAdvisor, setIsLoadingAdvisor] = useState<boolean>(false);

  // Modal State
  const [isCleanModalOpen, setIsCleanModalOpen] = useState<boolean>(false);
  const [itemsToClean, setItemsToClean] = useState<RecommendationItem[]>([]);

  // Fetch drives
  const fetchDrives = useCallback(async () => {
    setIsLoadingDrives(true);
    try {
      const res = await fetch('/api/drives');
      const data = await res.json();
      if (data.drives && data.drives.length > 0) {
        setDrives(data.drives);
        // Default to C if available, else first drive
        if (!selectedDrive) {
          const cDrive = data.drives.find((d: DriveInfo) => d.letter === 'C');
          setSelectedDrive(cDrive ? 'C' : data.drives[0].letter);
        }
      }
    } catch (err) {
      console.error("Failed to fetch drives:", err);
    } finally {
      setIsLoadingDrives(false);
    }
  }, [selectedDrive]);

  // Fetch Advisor Recommendations
  const fetchAdvisor = useCallback(async (driveLetter: string) => {
    setIsLoadingAdvisor(true);
    try {
      const res = await fetch(`/api/recommendations?drive=${driveLetter}`);
      const data = await res.json();
      setAdvisorData(data);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setIsLoadingAdvisor(false);
    }
  }, []);

  // Fetch Explorer Tree
  const fetchTree = useCallback(async (targetPath: string) => {
    setIsLoadingTree(true);
    setCurrentScanPath(targetPath);
    try {
      const res = await fetch(`/api/scan?path=${encodeURIComponent(targetPath)}&depth=2`);
      const data = await res.json();
      setTreeData(data);
    } catch (err) {
      console.error("Failed to fetch tree:", err);
    } finally {
      setIsLoadingTree(false);
    }
  }, []);

  // On mount
  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  // When drive selection changes
  useEffect(() => {
    if (selectedDrive) {
      const rootPath = `${selectedDrive}:\\`;
      fetchAdvisor(selectedDrive);
      fetchTree(rootPath);
    }
  }, [selectedDrive, fetchAdvisor, fetchTree]);

  // Handle open in explorer
  const handleOpenExplorer = async (path: string) => {
    try {
      await fetch('/api/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
    } catch (err) {
      console.error("Failed to open explorer:", err);
    }
  };

  // Handle Clean Execution
  const handleConfirmClean = async (paths: string[], useRecycleBin: boolean): Promise<CleanResult | null> => {
    try {
      const res = await fetch('/api/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths, use_recycle_bin: useRecycleBin })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Clean error:", err);
      return null;
    }
  };

  // Refresh all data
  const handleRefresh = () => {
    fetchDrives();
    if (selectedDrive) {
      fetchAdvisor(selectedDrive);
      fetchTree(currentScanPath);
    }
  };

  const currentDriveInfo = drives.find(d => d.letter === selectedDrive) || (drives.length > 0 ? drives[0] : null);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        drives={drives}
        selectedDrive={selectedDrive}
        onSelectDrive={(letter) => setSelectedDrive(letter)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onRefresh={handleRefresh}
        isLoading={isLoadingDrives || isLoadingTree || isLoadingAdvisor}
        advisorData={advisorData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Drive Storage Status Widget */}
        <DriveStats
          drive={currentDriveInfo}
          safeReclaimableFormatted={activeTab === 'explorer' ? advisorData?.summary.total_safe_formatted : undefined}
          onOpenAdvisor={() => setActiveTab('advisor')}
        />

        {/* Tab Views */}
        {activeTab === 'advisor' ? (
          <SmartAdvisor
            advisorData={advisorData}
            isLoading={isLoadingAdvisor}
            onOpenCleanModal={(items) => {
              setItemsToClean(items);
              setIsCleanModalOpen(true);
            }}
            onOpenExplorer={handleOpenExplorer}
          />
        ) : (
          <FileTree
            rootNode={treeData}
            isLoading={isLoadingTree}
            currentPath={currentScanPath}
            onNavigate={(path) => fetchTree(path)}
            onOpenExplorer={handleOpenExplorer}
          />
        )}

      </main>

      {/* Clean Confirmation Modal */}
      <CleanModal
        isOpen={isCleanModalOpen}
        onClose={() => setIsCleanModalOpen(false)}
        itemsToClean={itemsToClean}
        onConfirmClean={handleConfirmClean}
        onCleanupCompleted={handleRefresh}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        DiskLens • Open-Source Smart Disk Usage Visualizer & Safe Cleanup Advisor • Made for Windows & Modern Systems
      </footer>

    </div>
  );
}

export default App;
