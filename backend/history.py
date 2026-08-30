import os
import json
import time
from datetime import datetime
from typing import List, Dict, Any

HISTORY_FILE = os.path.join(os.path.dirname(__file__), "cleanup_history.json")

def load_history() -> List[Dict[str, Any]]:
    """Loads cleanup history from JSON file."""
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_history(records: List[Dict[str, Any]]):
    """Saves cleanup history to JSON file."""
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving history: {e}")

def record_cleanup_session(
    cleaned_paths: List[str],
    total_freed_bytes: int,
    total_freed_formatted: str,
    deleted_files: int,
    deleted_folders: int,
    skipped_count: int,
    used_recycle_bin: bool,
    details: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Records a new cleanup event into the history log."""
    now = datetime.now()
    months_id = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]
    
    date_str = f"{now.day} {months_id[now.month - 1]} {now.year}"
    time_str = now.strftime("%H:%M:%S")

    # Map details to clean items
    items_summary = []
    for d in details:
        p = d.get("path", "")
        f_size = d.get("bytes_freed_formatted", "0 B")
        status = d.get("status", "success")
        base_name = os.path.basename(p) or p
        
        items_summary.append({
            "name": base_name,
            "path": p,
            "size_freed": f_size,
            "status": status,
            "deleted_files": d.get("deleted_files", 0)
        })

    entry = {
        "id": f"clean_{int(time.time())}",
        "timestamp": now.isoformat(),
        "formatted_date": date_str,
        "formatted_time": time_str,
        "total_freed_bytes": total_freed_bytes,
        "total_freed_formatted": total_freed_formatted,
        "deleted_files": deleted_files,
        "deleted_folders": deleted_folders,
        "skipped_locked_files": skipped_count,
        "used_recycle_bin": used_recycle_bin,
        "items": items_summary
    }

    history = load_history()
    history.insert(0, entry)  # Prepend newest first
    # Keep last 100 sessions
    history = history[:100]
    save_history(history)
    return entry

def clear_all_history():
    """Clears all history logs."""
    save_history([])
