import os
import glob
import time
from typing import List, Dict, Any
from scanner import format_size, calculate_folder_size_fast

def get_smart_recommendations(drive_letter: str = "C") -> Dict[str, Any]:
    """
    Scans the system for known junk, cache, old profiles, and temporary files,
    returning structured recommendations organized by safety zones.
    """
    user_home = os.path.expanduser("~")
    local_appdata = os.environ.get("LOCALAPPDATA", os.path.join(user_home, "AppData", "Local"))
    appdata_roaming = os.environ.get("APPDATA", os.path.join(user_home, "AppData", "Roaming"))
    temp_dir = os.environ.get("TEMP", os.path.join(local_appdata, "Temp"))
    system_root = os.environ.get("SystemRoot", "C:\\Windows")

    recommendations = {
        "safe": [],
        "review": [],
        "protected": []
    }

    # =========================================================================
    # 🟢 1. SAFE TO DELETE (Zona Hijau: 100% Aman Dihapus Kapan Saja)
    # =========================================================================

    # A. User Temp & Windows Temp
    temp_paths = []
    if os.path.exists(temp_dir):
        temp_paths.append(temp_dir)
    win_temp = os.path.join(system_root, "Temp")
    if os.path.exists(win_temp):
        temp_paths.append(win_temp)
        
    temp_size = sum(calculate_folder_size_fast(p, max_depth=4) for p in temp_paths)
    if temp_size > 10 * 1024 * 1024:  # > 10 MB
        recommendations["safe"].append({
            "id": "win_temp_files",
            "title": "Temporary Windows & User Files (%TEMP%)",
            "app": "Windows System",
            "category": "safe",
            "safety_score": 100,
            "description": "File sementara yang dibuat oleh aplikasi yang sedang berjalan. Aman dihapus untuk memulihkan ruang penyimpanan seketika.",
            "impact": "Tidak mempengaruhi data pribadi atau aplikasi apa pun.",
            "paths": temp_paths,
            "total_bytes": temp_size,
            "total_formatted": format_size(temp_size),
            "default_checked": True
        })

    # B. Chrome Caches (Cache, Code Cache, GPUCache)
    chrome_cache_dirs = []
    chrome_user_data = os.path.join(local_appdata, "Google", "Chrome", "User Data")
    if os.path.exists(chrome_user_data):
        for pattern in ["Default/Cache", "Default/Code Cache", "Default/GPUCache", "Default/Media Cache",
                        "Profile */Cache", "Profile */Code Cache", "Profile */GPUCache"]:
            matches = glob.glob(os.path.join(chrome_user_data, pattern))
            chrome_cache_dirs.extend(matches)
            
    chrome_cache_size = sum(calculate_folder_size_fast(p, max_depth=3) for p in chrome_cache_dirs)
    if chrome_cache_size > 20 * 1024 * 1024:
        recommendations["safe"].append({
            "id": "chrome_browser_cache",
            "title": "Google Chrome Web & Media Cache",
            "app": "Google Chrome",
            "category": "safe",
            "safety_score": 98,
            "description": "Cache gambar, video, dan script website yang dikunjungi. Menghapus ini TIDAK akan menghapus bookmark, riwayat login, atau password.",
            "impact": "Browser mungkin membutuhkan beberapa milidetik ekstra saat pertama kali memuat ulang website yang sama.",
            "paths": chrome_cache_dirs,
            "total_bytes": chrome_cache_size,
            "total_formatted": format_size(chrome_cache_size),
            "default_checked": True
        })

    # C. Edge Caches
    edge_cache_dirs = []
    edge_user_data = os.path.join(local_appdata, "Microsoft", "Edge", "User Data")
    if os.path.exists(edge_user_data):
        for pattern in ["Default/Cache", "Default/Code Cache", "Default/GPUCache",
                        "Profile */Cache", "Profile */Code Cache", "Profile */GPUCache"]:
            matches = glob.glob(os.path.join(edge_user_data, pattern))
            edge_cache_dirs.extend(matches)
            
    edge_cache_size = sum(calculate_folder_size_fast(p, max_depth=3) for p in edge_cache_dirs)
    if edge_cache_size > 20 * 1024 * 1024:
        recommendations["safe"].append({
            "id": "edge_browser_cache",
            "title": "Microsoft Edge Web Cache",
            "app": "Microsoft Edge",
            "category": "safe",
            "safety_score": 98,
            "description": "Cache data penjelajahan Microsoft Edge. Tidak menghapus bookmark ataupun akun yang login.",
            "impact": "Sangat aman. Website akan memuat ulang aset baru jika diperlukan.",
            "paths": edge_cache_dirs,
            "total_bytes": edge_cache_size,
            "total_formatted": format_size(edge_cache_size),
            "default_checked": True
        })

    # D. Developer Caches (NPM Cache, Pip Cache, Gradle Caches)
    dev_cache_paths = []
    npm_cache = os.path.join(local_appdata, "npm-cache")
    if not os.path.exists(npm_cache):
        npm_cache = os.path.join(user_home, ".npm", "_cacache")
    if os.path.exists(npm_cache):
        dev_cache_paths.append(npm_cache)

    pip_cache = os.path.join(local_appdata, "pip", "cache")
    if os.path.exists(pip_cache):
        dev_cache_paths.append(pip_cache)

    dev_cache_size = sum(calculate_folder_size_fast(p, max_depth=4) for p in dev_cache_paths)
    if dev_cache_size > 50 * 1024 * 1024:
        recommendations["safe"].append({
            "id": "dev_package_cache",
            "title": "Node.js (NPM) & Python (Pip) Package Cache",
            "app": "Dev Tools (NPM / Pip)",
            "category": "safe",
            "safety_score": 95,
            "description": "Salinan unduhan package lama npm & pip. Menghapus ini aman dan tidak akan merusak node_modules atau virtualenv pada proyek Anda.",
            "impact": "Instalasi package baru berikutnya akan mengunduh langsung dari registry online.",
            "paths": dev_cache_paths,
            "total_bytes": dev_cache_size,
            "total_formatted": format_size(dev_cache_size),
            "default_checked": True
        })

    # E. Delivery Optimization / Windows Update Cache (D: or C:)
    delivery_paths = [
        "D:\\DeliveryOptimization",
        "C:\\DeliveryOptimization",
        os.path.join(system_root, "SoftwareDistribution", "Download")
    ]
    existing_delivery = [p for p in delivery_paths if os.path.exists(p)]
    delivery_size = sum(calculate_folder_size_fast(p, max_depth=3) for p in existing_delivery)
    if delivery_size > 100 * 1024 * 1024:
        recommendations["safe"].append({
            "id": "delivery_opt_cache",
            "title": "Windows Update & Delivery Optimization Cache",
            "app": "Windows Update",
            "category": "safe",
            "safety_score": 95,
            "description": "Sisa file paket instalasi pembaruan Windows yang sudah selesai diinstall atau didistribusikan.",
            "impact": "Sangat aman. Sistem Windows tetap berjalan normal.",
            "paths": existing_delivery,
            "total_bytes": delivery_size,
            "total_formatted": format_size(delivery_size),
            "default_checked": True
        })

    # F. GPU / AMD / DirectX Shader Cache
    shader_paths = [
        os.path.join(local_appdata, "AMD", "DxCache"),
        os.path.join(local_appdata, "AMD", "D3DSCache"),
        os.path.join(local_appdata, "D3DSCache")
    ]
    existing_shaders = [p for p in shader_paths if os.path.exists(p)]
    shader_size = sum(calculate_folder_size_fast(p, max_depth=2) for p in existing_shaders)
    if shader_size > 50 * 1024 * 1024:
        recommendations["safe"].append({
            "id": "gpu_shader_cache",
            "title": "GPU DirectX / AMD Shader Cache",
            "app": "Graphics Driver",
            "category": "safe",
            "safety_score": 96,
            "description": "Kompilasi shader grafis game/aplikasi lama. Driver akan membuat ulang shader baru saat game dijalankan.",
            "impact": "Game mungkin akan mengompilasi ulang shader saat pertama kali dibuka kembali.",
            "paths": existing_shaders,
            "total_bytes": shader_size,
            "total_formatted": format_size(shader_size),
            "default_checked": True
        })

    # =========================================================================
    # 🟡 2. REVIEW NEEDED (Zona Kuning: Sangat Disarankan Ditinjau Dulu)
    # =========================================================================

    # A. Chrome Corrupted & Old Backup Profiles
    corrupted_profiles = []
    if os.path.exists(chrome_user_data):
        for pattern in ["*.old", "*.corrupted*", "Profile *.old", "Profile *.corrupted*"]:
            matches = glob.glob(os.path.join(chrome_user_data, pattern))
            corrupted_profiles.extend(matches)

    corrupted_size = sum(calculate_folder_size_fast(p, max_depth=4) for p in corrupted_profiles)
    if corrupted_size > 50 * 1024 * 1024:
        recommendations["review"].append({
            "id": "chrome_corrupted_profiles",
            "title": "Chrome Corrupted & Backup Old Profiles (.corrupted / .old)",
            "app": "Google Chrome",
            "category": "review",
            "safety_score": 85,
            "description": "Folder cadangan profil Chrome yang rusak di masa lalu (seperti Profile.corrupted_2026...). Folder ini sudah tidak lagi digunakan oleh Chrome aktif.",
            "impact": "Aman dihapus jika profil Chrome aktif Anda saat ini sudah berjalan normal.",
            "paths": corrupted_profiles,
            "total_bytes": corrupted_size,
            "total_formatted": format_size(corrupted_size),
            "default_checked": False
        })

    # B. CapCut Video Render & Proxy Cache
    capcut_cache_dirs = [
        os.path.join(local_appdata, "CapCut", "User Data", "Cache"),
        os.path.join(local_appdata, "CapCut", "User Data", "temp"),
        "D:\\Capcut\\Cache",
        "D:\\Capcut\\temp"
    ]
    existing_capcut = [p for p in capcut_cache_dirs if os.path.exists(p)]
    capcut_size = sum(calculate_folder_size_fast(p, max_depth=3) for p in existing_capcut)
    if capcut_size > 100 * 1024 * 1024:
        recommendations["review"].append({
            "id": "capcut_render_cache",
            "title": "CapCut Video Editing Render & Proxy Cache",
            "app": "CapCut Video Editor",
            "category": "review",
            "safety_score": 88,
            "description": "File proxy dan cache preview video editing CapCut. Menghapus ini TIDAK menghapus video asli atau draft proyek Anda.",
            "impact": "CapCut akan me-render ulang preview jika Anda membuka proyek lama yang butuh proxy.",
            "paths": existing_capcut,
            "total_bytes": capcut_size,
            "total_formatted": format_size(capcut_size),
            "default_checked": False
        })

    # C. Spotify Offline Music Cache
    spotify_cache_dirs = [
        os.path.join(local_appdata, "Spotify", "Storage"),
        os.path.join(local_appdata, "Spotify", "Data"),
        os.path.join(local_appdata, "Packages", "SpotifyAB.SpotifyMusic_zpdnekdrzrea0", "LocalState", "Spotify", "Storage")
    ]
    existing_spotify = [p for p in spotify_cache_dirs if os.path.exists(p)]
    spotify_size = sum(calculate_folder_size_fast(p, max_depth=3) for p in existing_spotify)
    if spotify_size > 100 * 1024 * 1024:
        recommendations["review"].append({
            "id": "spotify_offline_cache",
            "title": "Spotify Offline Music & Stream Cache",
            "app": "Spotify",
            "category": "review",
            "safety_score": 90,
            "description": "Cache audio lagu-lagu yang pernah diputar atau diunduh secara offline di Spotify.",
            "impact": "Playlist dan lagu favorit Anda tetap tersimpan di akun Anda, tetapi lagu offline perlu diunduh ulang.",
            "paths": existing_spotify,
            "total_bytes": spotify_size,
            "total_formatted": format_size(spotify_size),
            "default_checked": False
        })

    # D. Old Download Installers (> 30 days old .exe, .msi, .iso, .zip)
    downloads_folders = [
        os.path.join(user_home, "Downloads"),
        "D:\\Hype 5 AMD\\Downloads"
    ]
    old_download_files = []
    old_download_size = 0
    thirty_days_ago = time.time() - (30 * 24 * 60 * 60)
    installer_extensions = {".exe", ".msi", ".iso", ".zip", ".rar", ".7z", ".tar.gz"}
    
    for dl_dir in downloads_folders:
        if os.path.exists(dl_dir):
            try:
                for entry in os.scandir(dl_dir):
                    if entry.is_file():
                        ext = os.path.splitext(entry.name)[1].lower()
                        if ext in installer_extensions:
                            stat = entry.stat()
                            if stat.st_mtime < thirty_days_ago:
                                old_download_files.append(entry.path)
                                old_download_size += stat.st_size
            except Exception:
                pass

    if old_download_size > 100 * 1024 * 1024:
        recommendations["review"].append({
            "id": "old_downloads_installers",
            "title": "Installer & Arsip Lama di Folder Downloads (> 30 Hari)",
            "app": "Downloads",
            "category": "review",
            "safety_score": 75,
            "description": f"Ditemukan {len(old_download_files)} file installer software (.exe/.msi) atau arsip (.zip/.iso) di folder Downloads yang sudah tidak disentuh selama lebih dari 30 hari.",
            "impact": "Pastikan file installer ini sudah terinstall di PC Anda sebelum dibersihkan.",
            "paths": old_download_files,
            "total_bytes": old_download_size,
            "total_formatted": format_size(old_download_size),
            "default_checked": False
        })

    # =========================================================================
    # 🔴 3. PROTECTED ZONE (Zona Merah: Wajib Dilindungi / Jangan Dihapus)
    # =========================================================================
    protected_items = [
        {
            "name": "C:\\Windows (System OS)",
            "path": "C:\\Windows",
            "reason": "Inti sistem operasi Windows, driver, pustaka DLL, dan layanan sistem. Menghapus ini akan merusak Windows."
        },
        {
            "name": "pagefile.sys (Virtual Memory)",
            "path": "C:\\pagefile.sys",
            "reason": "File swap RAM dinamis Windows. Dikelola langsung oleh kernel Windows saat membuka banyak tab atau program berat."
        },
        {
            "name": "hiberfil.sys (Fast Startup / Hibernate)",
            "path": "C:\\hiberfil.sys",
            "reason": "File state sistem untuk fitur Fast Boot dan Hibernasi."
        },
        {
            "name": "System Volume Information",
            "path": "C:\\System Volume Information",
            "reason": "Folder metadata partisi disk dan titik System Restore."
        }
    ]

    for p in protected_items:
        size = 0
        if os.path.exists(p["path"]):
            if os.path.isfile(p["path"]):
                try:
                    size = os.path.getsize(p["path"])
                except Exception:
                    pass
            else:
                # Quick shallow size
                size = calculate_folder_size_fast(p["path"], max_depth=1)

        recommendations["protected"].append({
            "id": f"protected_{p['name']}",
            "title": p["name"],
            "app": "Windows Core Protection",
            "category": "protected",
            "safety_score": 0,
            "description": p["reason"],
            "impact": "DILARANG DIHAPUS. Sistem memproteksi file ini secara otomatis.",
            "paths": [p["path"]],
            "total_bytes": size,
            "total_formatted": format_size(size) if size > 0 else "System Locked",
            "default_checked": False
        })

    # Calculate summary numbers
    total_safe_bytes = sum(item["total_bytes"] for item in recommendations["safe"])
    total_review_bytes = sum(item["total_bytes"] for item in recommendations["review"])

    return {
        "summary": {
            "total_safe_bytes": total_safe_bytes,
            "total_safe_formatted": format_size(total_safe_bytes),
            "total_review_bytes": total_review_bytes,
            "total_review_formatted": format_size(total_review_bytes),
            "total_reclaimable_bytes": total_safe_bytes + total_review_bytes,
            "total_reclaimable_formatted": format_size(total_safe_bytes + total_review_bytes),
            "safe_items_count": len(recommendations["safe"]),
            "review_items_count": len(recommendations["review"]),
            "protected_items_count": len(recommendations["protected"])
        },
        "recommendations": recommendations
    }
