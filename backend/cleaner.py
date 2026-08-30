import os
import shutil
import ctypes
from typing import List, Dict, Any
from scanner import format_size, calculate_folder_size_fast

try:
    from send2trash import send2trash
    HAS_SEND2TRASH = True
except ImportError:
    HAS_SEND2TRASH = False

# Hard-coded absolute protected paths that must NEVER be deleted under any circumstances
CRITICAL_BLACK_LIST = {
    "c:", "c:\\", "c:\\windows", "c:\\windows\\system32", "c:\\windows\\syswow64",
    "c:\\program files", "c:\\program files (x86)", "c:\\users",
    "c:\\pagefile.sys", "c:\\hiberfil.sys", "c:\\swapfile.sys",
    "c:\\system volume information", "c:\\$recycle.bin",
    "d:", "d:\\", "d:\\system volume information", "d:\\$recycle.bin",
    "e:", "e:\\", "e:\\system volume information", "e:\\$recycle.bin"
}

def is_path_safe_to_delete(target_path: str) -> bool:
    """Verifies that a path does not target or contain critical system files."""
    abs_path = os.path.abspath(target_path).lower()
    normalized = abs_path.rstrip("\\/")
    
    # Check if target is a root drive (e.g., 'c:', 'd:', 'c:\\', etc.)
    if len(normalized) <= 2 and normalized.endswith(":"):
        return False

    # Direct blacklist check
    if normalized in CRITICAL_BLACK_LIST or abs_path in CRITICAL_BLACK_LIST:
        return False
        
    # Prevent deletion of entire Windows or Users root folder
    if normalized.startswith("c:\\windows") and not normalized.startswith("c:\\windows\\temp") and not normalized.startswith("c:\\windows\\softwaredistribution\\download"):
        return False
        
    # Prevent deleting entire user profile folder
    user_home = os.path.expanduser("~").lower().rstrip("\\/")
    if normalized == user_home:
        return False
        
    return True

def empty_windows_recycle_bin() -> Dict[str, Any]:
    """
    Empties the Windows Recycle Bin on all drives immediately using Shell32 API.
    Flags: SHERB_NOCONFIRMATION (1) | SHERB_NOPROGRESSUI (2) | SHERB_NOSOUND (4) = 7
    """
    try:
        res = ctypes.windll.shell32.SHEmptyRecycleBinW(None, None, 7)
        return {"status": "success" if res == 0 else "info", "code": res}
    except Exception as e:
        return {"status": "error", "error": str(e)}

def delete_target_path(target_path: str, use_recycle_bin: bool = True) -> Dict[str, Any]:
    """
    Safely and rapidly deletes a file or directory.
    Uses atomic directory deletion with graceful fallback for locked files.
    """
    target_path = os.path.abspath(target_path)
    
    if not os.path.exists(target_path):
        return {"status": "not_found", "bytes_freed": 0, "path": target_path}
        
    if not is_path_safe_to_delete(target_path):
        return {
            "status": "error",
            "error": "Path is protected by system security rules and cannot be deleted.",
            "path": target_path,
            "bytes_freed": 0
        }

    bytes_freed = 0
    deleted_files = 0
    deleted_folders = 0
    skipped_count = 0
    errors = []

    # Calculate initial size
    initial_size = calculate_folder_size_fast(target_path, max_depth=6) if os.path.isdir(target_path) else os.path.getsize(target_path)

    # 1. Single File Deletion
    if os.path.isfile(target_path):
        try:
            if use_recycle_bin and HAS_SEND2TRASH:
                send2trash(target_path)
            else:
                os.remove(target_path)
            bytes_freed = initial_size
            deleted_files = 1
        except Exception as e:
            skipped_count = 1
            errors.append(f"File locked or permission denied: {str(e)}")

    # 2. Directory Deletion
    elif os.path.isdir(target_path):
        # A. Try Fast Atomic Deletion First (Entire folder at once)
        # Note: Do not delete %TEMP% parent itself, only contents
        is_temp_root = target_path.lower().endswith("\\temp")
        deleted_atomically = False

        if not is_temp_root:
            try:
                if use_recycle_bin and HAS_SEND2TRASH:
                    send2trash(target_path)
                else:
                    shutil.rmtree(target_path)
                bytes_freed = initial_size
                deleted_folders = 1
                deleted_atomically = True
            except Exception:
                deleted_atomically = False

        # B. Fallback: If atomic deletion failed (e.g. locked files inside), delete unlocked files item-by-item
        if not deleted_atomically:
            try:
                with os.scandir(target_path) as it:
                    for entry in it:
                        try:
                            if entry.is_file(follow_symlinks=False):
                                f_size = entry.stat(follow_symlinks=False).st_size
                                if use_recycle_bin and HAS_SEND2TRASH:
                                    send2trash(entry.path)
                                else:
                                    os.remove(entry.path)
                                bytes_freed += f_size
                                deleted_files += 1
                            elif entry.is_dir(follow_symlinks=False):
                                d_size = calculate_folder_size_fast(entry.path, max_depth=5)
                                try:
                                    if use_recycle_bin and HAS_SEND2TRASH:
                                        send2trash(entry.path)
                                    else:
                                        shutil.rmtree(entry.path)
                                    bytes_freed += d_size
                                    deleted_folders += 1
                                except Exception:
                                    skipped_count += 1
                        except Exception:
                            skipped_count += 1
            except Exception as e:
                errors.append(f"Error scanning directory {target_path}: {str(e)}")

    return {
        "status": "success" if bytes_freed > 0 else "skipped" if skipped_count > 0 else "empty",
        "path": target_path,
        "bytes_freed": bytes_freed,
        "bytes_freed_formatted": format_size(bytes_freed),
        "deleted_files": deleted_files,
        "deleted_folders": deleted_folders,
        "skipped_locked_items": skipped_count,
        "errors": errors[:3]
    }

def clean_selected_recommendations(paths: List[str], use_recycle_bin: bool = True) -> Dict[str, Any]:
    """
    Cleans multiple paths selected from the recommendations list rapidly.
    """
    total_freed = 0
    total_files = 0
    total_folders = 0
    total_skipped = 0
    results = []

    for path in paths:
        res = delete_target_path(path, use_recycle_bin=use_recycle_bin)
        total_freed += res.get("bytes_freed", 0)
        total_files += res.get("deleted_files", 0)
        total_folders += res.get("deleted_folders", 0)
        total_skipped += res.get("skipped_locked_items", 0)
        results.append(res)

    return {
        "total_bytes_freed": total_freed,
        "total_freed_formatted": format_size(total_freed),
        "total_deleted_files": total_files,
        "total_deleted_folders": total_folders,
        "total_skipped_locked_files": total_skipped,
        "used_recycle_bin": use_recycle_bin,
        "details": results
    }
