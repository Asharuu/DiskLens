import os
import shutil
from typing import List, Dict, Any
from scanner import format_size

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

def delete_target_path(target_path: str, use_recycle_bin: bool = True) -> Dict[str, Any]:
    """
    Safely deletes a single file or folder (or contents of a folder),
    optionally sending it to the Windows Recycle Bin.
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

    if os.path.isfile(target_path):
        try:
            f_size = os.path.getsize(target_path)
            if use_recycle_bin and HAS_SEND2TRASH:
                send2trash(target_path)
            else:
                os.remove(target_path)
            bytes_freed += f_size
            deleted_files += 1
        except Exception as e:
            skipped_count += 1
            errors.append(f"Failed to delete {target_path}: {str(e)}")
    elif os.path.isdir(target_path):
        # Delete contents inside or folder itself
        # For cache directories, deleting items inside is usually best
        try:
            for root, dirs, files in os.walk(target_path, topdown=False):
                for file in files:
                    file_path = os.path.join(root, file)
                    try:
                        f_size = os.path.getsize(file_path)
                        if use_recycle_bin and HAS_SEND2TRASH:
                            send2trash(file_path)
                        else:
                            os.remove(file_path)
                        bytes_freed += f_size
                        deleted_files += 1
                    except Exception:
                        skipped_count += 1
                        
                for d in dirs:
                    dir_path = os.path.join(root, d)
                    try:
                        if use_recycle_bin and HAS_SEND2TRASH:
                            send2trash(dir_path)
                        else:
                            os.rmdir(dir_path)
                        deleted_folders += 1
                    except Exception:
                        skipped_count += 1

            # Try deleting the parent folder itself if not Temp/root
            if not target_path.lower().endswith("temp"):
                try:
                    if use_recycle_bin and HAS_SEND2TRASH:
                        send2trash(target_path)
                    else:
                        os.rmdir(target_path)
                    deleted_folders += 1
                except Exception:
                    pass
        except Exception as e:
            errors.append(f"Error traversing directory {target_path}: {str(e)}")

    return {
        "status": "success" if bytes_freed > 0 or skipped_count == 0 else "partial",
        "path": target_path,
        "bytes_freed": bytes_freed,
        "bytes_freed_formatted": format_size(bytes_freed),
        "deleted_files": deleted_files,
        "deleted_folders": deleted_folders,
        "skipped_locked_items": skipped_count,
        "errors": errors[:5]
    }

def clean_selected_recommendations(paths: List[str], use_recycle_bin: bool = True) -> Dict[str, Any]:
    """
    Cleans multiple paths selected from the recommendations list.
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
