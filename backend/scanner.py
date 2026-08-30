import os
import ctypes
import string
import time
from typing import List, Dict, Any, Optional

def format_size(bytes_size: int) -> str:
    """Format bytes to human readable string (KB, MB, GB, TB)."""
    if bytes_size < 1024:
        return f"{bytes_size} B"
    elif bytes_size < 1024 * 1024:
        return f"{bytes_size / 1024:.2f} KB"
    elif bytes_size < 1024 * 1024 * 1024:
        return f"{bytes_size / (1024 * 1024):.2f} MB"
    elif bytes_size < 1024 * 1024 * 1024 * 1024:
        return f"{bytes_size / (1024 * 1024 * 1024):.2f} GB"
    else:
        return f"{bytes_size / (1024 * 1024 * 1024 * 1024):.2f} TB"

def get_drives_info() -> List[Dict[str, Any]]:
    """Detect all available Windows drives with capacity, used, and free space."""
    drives = []
    bitmask = ctypes.windll.kernel32.GetLogicalDrives()
    
    for letter in string.ascii_uppercase:
        if bitmask & 1:
            drive_path = f"{letter}:\\"
            drive_type = ctypes.windll.kernel32.GetDriveTypeW(drive_path)
            
            # DRIVE_FIXED = 3, DRIVE_REMOVABLE = 2, DRIVE_REMOTE = 4, DRIVE_CDROM = 5, DRIVE_RAMDISK = 6
            type_name = "Fixed Disk" if drive_type == 3 else "Removable" if drive_type == 2 else "Drive"
            
            free_bytes = ctypes.c_ulonglong(0)
            total_bytes = ctypes.c_ulonglong(0)
            total_free_bytes = ctypes.c_ulonglong(0)
            
            success = ctypes.windll.kernel32.GetDiskFreeSpaceExW(
                ctypes.c_wchar_p(drive_path),
                ctypes.byref(free_bytes),
                ctypes.byref(total_bytes),
                ctypes.byref(total_free_bytes)
            )
            
            if success:
                tot = total_bytes.value
                fre = free_bytes.value
                usd = tot - fre
                free_pct = (fre / tot * 100) if tot > 0 else 0
                used_pct = (usd / tot * 100) if tot > 0 else 0
                
                # Volume label
                volume_name_buffer = ctypes.create_unicode_buffer(1024)
                ctypes.windll.kernel32.GetVolumeInformationW(
                    ctypes.c_wchar_p(drive_path),
                    volume_name_buffer,
                    ctypes.sizeof(volume_name_buffer),
                    None, None, None, None, 0
                )
                
                drives.append({
                    "letter": letter,
                    "path": drive_path,
                    "label": volume_name_buffer.value or f"Local Disk ({letter}:)",
                    "type": type_name,
                    "total_bytes": tot,
                    "used_bytes": usd,
                    "free_bytes": fre,
                    "total_formatted": format_size(tot),
                    "used_formatted": format_size(usd),
                    "free_formatted": format_size(fre),
                    "free_percent": round(free_pct, 2),
                    "used_percent": round(used_pct, 2),
                    "is_critical": free_pct < 10.0
                })
        bitmask >>= 1
        
    return drives

def calculate_folder_size_fast(folder_path: str, max_depth: int = 10) -> int:
    """Quickly calculate total size of a folder handling permission errors gracefully."""
    total = 0
    try:
        with os.scandir(folder_path) as it:
            for entry in it:
                try:
                    if entry.is_file(follow_symlinks=False):
                        total += entry.stat(follow_symlinks=False).st_size
                    elif entry.is_dir(follow_symlinks=False) and max_depth > 0:
                        total += calculate_folder_size_fast(entry.path, max_depth - 1)
                except (PermissionError, FileNotFoundError, OSError):
                    continue
    except (PermissionError, FileNotFoundError, OSError):
        pass
    return total

def scan_directory_tree(target_path: str, max_depth: int = 2) -> Dict[str, Any]:
    """
    Scan a directory up to max_depth and return structured size hierarchy.
    """
    target_path = os.path.abspath(target_path)
    
    if not os.path.exists(target_path):
        return {"error": "Path does not exist", "path": target_path}

    def _scan_node(current_path: str, current_depth: int) -> Dict[str, Any]:
        node_name = os.path.basename(current_path) or current_path
        children = []
        folder_size = 0
        file_count = 0
        folder_count = 0
        
        try:
            with os.scandir(current_path) as it:
                entries = list(it)
                for entry in entries:
                    try:
                        if entry.is_file(follow_symlinks=False):
                            f_size = entry.stat(follow_symlinks=False).st_size
                            folder_size += f_size
                            file_count += 1
                            if current_depth < max_depth:
                                ext = os.path.splitext(entry.name)[1].lower()
                                children.append({
                                    "name": entry.name,
                                    "path": entry.path,
                                    "is_dir": False,
                                    "size_bytes": f_size,
                                    "size_formatted": format_size(f_size),
                                    "extension": ext,
                                    "children": []
                                })
                        elif entry.is_dir(follow_symlinks=False):
                            folder_count += 1
                            if current_depth < max_depth:
                                child_node = _scan_node(entry.path, current_depth + 1)
                                folder_size += child_node["size_bytes"]
                                file_count += child_node.get("file_count", 0)
                                children.append(child_node)
                            else:
                                # For folders at max_depth, calculate size without expanding further
                                c_size = calculate_folder_size_fast(entry.path, max_depth=5)
                                folder_size += c_size
                                children.append({
                                    "name": entry.name,
                                    "path": entry.path,
                                    "is_dir": True,
                                    "size_bytes": c_size,
                                    "size_formatted": format_size(c_size),
                                    "children": []
                                })
                    except (PermissionError, FileNotFoundError, OSError):
                        continue
        except (PermissionError, FileNotFoundError, OSError):
            pass
            
        # Sort children descending by size
        children.sort(key=lambda x: x["size_bytes"], reverse=True)
        
        # Calculate percentage for each child relative to parent
        for child in children:
            child["percentage"] = round((child["size_bytes"] / folder_size * 100), 2) if folder_size > 0 else 0
            
        return {
            "name": node_name,
            "path": current_path,
            "is_dir": True,
            "size_bytes": folder_size,
            "size_formatted": format_size(folder_size),
            "file_count": file_count,
            "folder_count": folder_count,
            "children": children
        }

    start_time = time.time()
    result = _scan_node(target_path, 0)
    result["scan_duration_sec"] = round(time.time() - start_time, 2)
    return result
