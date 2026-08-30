export interface DriveInfo {
  letter: string;
  path: string;
  label: string;
  type: string;
  total_bytes: number;
  used_bytes: number;
  free_bytes: number;
  total_formatted: string;
  used_formatted: string;
  free_formatted: string;
  free_percent: number;
  used_percent: number;
  is_critical: boolean;
}

export interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
  size_bytes: number;
  size_formatted: string;
  percentage?: number;
  extension?: string;
  file_count?: number;
  folder_count?: number;
  children?: FileNode[];
}

export interface RecommendationItem {
  id: string;
  title: string;
  app: string;
  category: 'safe' | 'review' | 'protected';
  safety_score: number;
  description: string;
  impact: string;
  paths: string[];
  total_bytes: number;
  total_formatted: string;
  default_checked?: boolean;
}

export interface AdvisorSummary {
  total_safe_bytes: number;
  total_safe_formatted: string;
  total_review_bytes: number;
  total_review_formatted: string;
  total_reclaimable_bytes: number;
  total_reclaimable_formatted: string;
  safe_items_count: number;
  review_items_count: number;
  protected_items_count: number;
}

export interface AdvisorData {
  summary: AdvisorSummary;
  recommendations: {
    safe: RecommendationItem[];
    review: RecommendationItem[];
    protected: RecommendationItem[];
  };
}

export interface CleanDetail {
  status: string;
  path: string;
  bytes_freed: number;
  bytes_freed_formatted: string;
  deleted_files: number;
  deleted_folders: number;
  skipped_locked_items: number;
  errors?: string[];
}

export interface CleanResult {
  total_bytes_freed: number;
  total_freed_formatted: string;
  total_deleted_files: number;
  total_deleted_folders: number;
  total_skipped_locked_files: number;
  used_recycle_bin: boolean;
  details: CleanDetail[];
}
