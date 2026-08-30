import os
import re
from typing import Dict, Any, Optional

# Comprehensive Knowledge Base for known Windows, AppData, Developer, and Gaming directories
DIRECTORY_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    # GPU & Graphics Caches
    "dxcache": {
        "title": "DirectX Shader Cache (AMD / GPU)",
        "owner": "Kartu Grafis AMD / DirectX",
        "category": "safe",
        "safety_score": 98,
        "safety_label": "🟢 100% Sangat Aman Dihapus",
        "summary": "Folder penyimpanan shader grafis DirectX yang sudah dikompilasi oleh kartu grafis AMD.",
        "purpose": "Mempercepat waktu loading grafis dan mencegah stuttering saat bermain game 3D.",
        "if_deleted": "Sangat aman. Game hanya akan memproses ulang shader saat pertama kali dibuka kembali. Tidak mempengaruhi save game atau driver.",
        "recommendation": "Bagus untuk dibersihkan jika Anda butuh ruang ekstra atau baru saja mengupdate driver GPU."
    },
    "d3dscache": {
        "title": "Direct3D Shader Cache (Microsoft Windows)",
        "owner": "Microsoft DirectX / Direct3D",
        "category": "safe",
        "safety_score": 98,
        "safety_label": "🟢 100% Sangat Aman Dihapus",
        "summary": "Cache akselerasi grafis Direct3D bawaan sistem operasi Windows.",
        "purpose": "Menyimpan shader rendering grafis untuk browser (Chrome/Edge), aplikasi desktop (Discord/Spotify/VS Code), dan game Windows.",
        "if_deleted": "Aman. Windows dan aplikasi akan otomatis membuat cache baru saat dibutuhkan.",
        "recommendation": "Bisa dibersihkan dengan aman tanpa risiko merusak sistem."
    },
    # Temporary & System
    "temp": {
        "title": "Folder File Sementara (%TEMP%)",
        "owner": "Windows & Berbagai Aplikasi",
        "category": "safe",
        "safety_score": 100,
        "safety_label": "🟢 100% Sangat Aman Dihapus",
        "summary": "Tempat penampungan file sementara yang dibuat oleh program saat sedang aktif atau menginstall sesuatu.",
        "purpose": "Menyimpan data runtime sementara yang seharusnya dihapus setelah aplikasi ditutup.",
        "if_deleted": "Aman dihapus total. File yang sedang dipakai aplikasi aktif akan otomatis dilewati oleh sistem.",
        "recommendation": "Sangat disarankan untuk dibersihkan secara rutin."
    },
    "deliveryoptimization": {
        "title": "Delivery Optimization Cache",
        "owner": "Windows Update",
        "category": "safe",
        "safety_score": 95,
        "safety_label": "🟢 100% Sangat Aman Dihapus",
        "summary": "Cache unduhan pembaruan Windows yang digunakan untuk berbagi update di jaringan lokal.",
        "purpose": "Mempercepat unduhan update jika ada beberapa PC di jaringan yang sama.",
        "if_deleted": "Aman. Windows Update tetap berjalan normal dan akan mengunduh langsung dari server Microsoft jika ada update baru.",
        "recommendation": "Bisa dibersihkan jika memakan ruang bergiga-giga."
    },
    "softwaredistribution": {
        "title": "Windows Update Software Distribution",
        "owner": "Windows Update Service",
        "category": "safe",
        "safety_score": 90,
        "safety_label": "🟢 Aman Dihapus (Khusus Folder Download)",
        "summary": "Tempat Windows menyimpan file instalasi pembaruan Windows Update.",
        "purpose": "Menampung file installer Windows Update sebelum dan sesudah dipasang.",
        "if_deleted": "Aman. File installer lama yang sudah terpasang akan terhapus.",
        "recommendation": "Folder sub-direktori 'Download' di dalamnya sangat aman dibersihkan."
    },
    # Browsers
    "google": {
        "title": "Google Chrome Data & Profiles",
        "owner": "Google Chrome",
        "category": "review",
        "safety_score": 80,
        "safety_label": "🟡 Perlu Ditinjau (Pilih Sub-Folder Cache / Old Saja)",
        "summary": "Folder induk seluruh data browser Google Chrome (profil, cache, ekstensi, riwayat, bookmark).",
        "purpose": "Menyimpan seluruh konfigurasi dan data penjelajahan akun Google Anda.",
        "if_deleted": "JANGAN hapus seluruh folder Google! Hanya bersihkan subfolder 'Cache' atau profil rusak (seperti .old / .corrupted).",
        "recommendation": "Gunakan tab Smart Advisor DiskLens untuk membersihkan bagian cachenya saja secara aman."
    },
    "capcut": {
        "title": "CapCut Video Editor Cache & Data",
        "owner": "CapCut (ByteDance)",
        "category": "review",
        "safety_score": 85,
        "safety_label": "🟡 Aman Bersihkan Subfolder Cache / Proxy",
        "summary": "Menyimpan proyek video editing, aset stiker, efek, dan file preview proxy render.",
        "purpose": "Menyimpan draft video dan cache rendering agar proses edit lebih lancar.",
        "if_deleted": "Menghapus subfolder 'Cache' TIDAK menghapus video asli atau draft proyek Anda. CapCut hanya akan me-render ulang preview jika diperlukan.",
        "recommendation": "Sangat disarankan membersihkan subfolder 'Cache' jika ukuran CapCut membengkak."
    },
    "spotify": {
        "title": "Spotify Data & Audio Stream Storage",
        "owner": "Spotify AB",
        "category": "review",
        "safety_score": 85,
        "safety_label": "🟡 Aman Bersihkan Subfolder Storage (Cache Lagu)",
        "summary": "Menyimpan file audio terenkripsi dari lagu-lagu yang pernah Anda putar atau download offline.",
        "purpose": "Mencegah streaming berulang untuk lagu yang sering Anda dengarkan.",
        "if_deleted": "Playlist dan akun Anda tetap aman di cloud. Lagu offline yang didownload perlu di-download ulang jika ingin didengarkan tanpa internet.",
        "recommendation": "Bersihkan jika Anda membutuhkan ruang kosong ekstra."
    },
    "npm-cache": {
        "title": "Node.js (NPM) Package Cache",
        "owner": "NPM / Node.js",
        "category": "safe",
        "safety_score": 95,
        "safety_label": "🟢 100% Sangat Aman Dihapus",
        "summary": "Salinan arsip tarball paket modul Node.js yang pernah Anda install sebelumnya.",
        "purpose": "Mempercepat instalasi `npm install` offline untuk modul yang sama.",
        "if_deleted": "Tidak merusak project atau folder `node_modules` Anda. NPM akan mengunduh dari registry online saat install modul baru.",
        "recommendation": "Sangat aman dibersihkan."
    },
    ".gradle": {
        "title": "Gradle Build Cache",
        "owner": "Gradle / Android Studio",
        "category": "review",
        "safety_score": 85,
        "safety_label": "🟡 Aman Dihapus (Build Pertama Akan Download Ulang)",
        "summary": "Cache dependensi library dan wrapper Gradle untuk proyek Android / Java.",
        "purpose": "Menyimpan library Gradle agar tidak perlu diunduh berulang saat build proyek.",
        "if_deleted": "Aman. Saat menjalankan `gradle build` berikutnya, Gradle akan mengunduh otomatis dependensi yang dibutuhkan.",
        "recommendation": "Bisa dibersihkan jika proyek Android Studio lama sudah tidak aktif."
    },
    ".android": {
        "title": "Android SDK & Emulator Virtual Devices (AVD)",
        "owner": "Google Android SDK / Android Studio",
        "category": "review",
        "safety_score": 70,
        "safety_label": "🟡 Perlu Ditinjau (Berisi Emulator AVD)",
        "summary": "Menyimpan konfigurasi Android SDK, kunci debug, dan disk image emulator Android (AVD).",
        "purpose": "Menjalankan emulator Android virtual di komputer Anda.",
        "if_deleted": "Menghapus folder ini akan menghapus emulator Android virtual yang pernah Anda buat di Android Studio.",
        "recommendation": "Hapus hanya jika Anda tidak lagi memerlukan emulator Android tertentu."
    },
    # Critical System Paths
    "windows": {
        "title": "Sistem Operasi Microsoft Windows",
        "owner": "Microsoft Windows OS",
        "category": "protected",
        "safety_score": 0,
        "safety_label": "🔴 DILARANG DIHAPUS (Sistem Inti)",
        "summary": "Folder inti seluruh sistem operasi Windows, driver, file kernel, dan pustaka DLL penting.",
        "purpose": "Menjalankan seluruh komputer dan perangkat keras Anda.",
        "if_deleted": "FATAL! Menghapus folder ini akan merusak Windows dan komputer tidak bisa dinyalakan (Blue Screen / Boot Loop).",
        "recommendation": "Jangan pernah menghapus atau memodifikasi isi folder ini secara manual!"
    },
    "pagefile.sys": {
        "title": "Virtual Memory (Page File)",
        "owner": "Windows Memory Manager Kernel",
        "category": "protected",
        "safety_score": 0,
        "safety_label": "🔴 DILARANG DIHAPUS MANUAL (Virtual RAM)",
        "summary": "File swap memori yang digunakan Windows sebagai perpanjangan dari kapasitas RAM fisik.",
        "purpose": "Mencegah komputer crash ketika aplikasi (seperti banyak tab Chrome atau game) menghabiskan RAM fisik.",
        "if_deleted": "File ini dikunci oleh kernel Windows. Ukurannya akan menyusut otomatis saat aplikasi berat ditutup.",
        "recommendation": "Biarkan Windows mengelolanya secara otomatis."
    },
    "hiberfil.sys": {
        "title": "Windows Hibernation & Fast Startup File",
        "owner": "Windows Power Management",
        "category": "protected",
        "safety_score": 10,
        "safety_label": "🔴 Jangan Dihapus Manual (Gunakan Perintah Powercfg)",
        "summary": "Menyimpan snapshot memori saat PC dimatikan untuk fitur Fast Startup atau mode Hibernasi.",
        "purpose": "Mempercepat proses menyalakan laptop/PC.",
        "if_deleted": "Hanya bisa dinonaktifkan secara resmi melalui perintah `powercfg -h off` di Command Prompt Administrator.",
        "recommendation": "Jangan dipaksa hapus secara manual."
    },
    "system volume information": {
        "title": "System Volume Information & Restore Points",
        "owner": "Windows File System & VSS",
        "category": "protected",
        "safety_score": 0,
        "safety_label": "🔴 DILARANG DIHAPUS (Sistem Partisi)",
        "summary": "Menyimpan database indexing partisi, System Restore Points, dan metadata Volume Shadow Copy.",
        "purpose": "Pemulihan sistem dan manajemen partisi NTFS.",
        "if_deleted": "Ditolak dan dikunci oleh Windows System.",
        "recommendation": "Terkunci dan aman secara otomatis."
    }
}

def analyze_directory_purpose(target_path: str) -> Dict[str, Any]:
    """
    Intelligently analyzes any directory or file path and returns human-friendly explanations,
    identifying the application owner, purpose, safety level, and consequences of deletion.
    """
    target_path = os.path.abspath(target_path)
    base_name = os.path.basename(target_path).lower()
    path_lower = target_path.lower()
    
    # 1. Direct Knowledge Base Lookup
    if base_name in DIRECTORY_KNOWLEDGE_BASE:
        info = DIRECTORY_KNOWLEDGE_BASE[base_name].copy()
        info["path"] = target_path
        info["exists"] = os.path.exists(target_path)
        return info

    # 2. Key matching in path
    for key, data in DIRECTORY_KNOWLEDGE_BASE.items():
        if f"\\{key}\\" in path_lower or path_lower.endswith(f"\\{key}"):
            info = data.copy()
            info["path"] = target_path
            info["exists"] = os.path.exists(target_path)
            return info

    # 3. Smart Heuristic Analysis for Arbitrary Folders
    # A. Check if under Windows System
    if path_lower.startswith("c:\\windows"):
        return {
            "title": f"Komponen Sistem Windows ({os.path.basename(target_path)})",
            "owner": "Microsoft Windows System",
            "category": "protected",
            "safety_score": 0,
            "safety_label": "🔴 DILARANG DIHAPUS (Sistem Windows)",
            "summary": "Bagian dari instalasi sistem operasi Windows.",
            "purpose": "Menyediakan layanan sistem, driver, atau konfigurasi sistem Windows.",
            "if_deleted": "Berbahaya. Bisa merusak fungsionalitas Windows atau aplikasi bawaan.",
            "recommendation": "Jangan dihapus!",
            "path": target_path,
            "exists": os.path.exists(target_path)
        }

    # B. Cache / Temp Pattern Matching
    if any(word in base_name for word in ["cache", "temp", "tmp", "crashpad", "logs", "gpucache"]):
        return {
            "title": f"Data Cache / Temporary ({os.path.basename(target_path)})",
            "owner": "Aplikasi Pembuat Folder",
            "category": "safe",
            "safety_score": 95,
            "safety_label": "🟢 Sangat Aman Dihapus (File Cache)",
            "summary": "Direktori penampung data sementara atau cache dari aplikasi.",
            "purpose": "Menyimpan data cache agar aplikasi memuat data lebih cepat di sesi berikutnya.",
            "if_deleted": "Aman. Aplikasi akan membuat ulang cache baru yang segar jika dibutuhkan kembali.",
            "recommendation": "Aman untuk dibersihkan guna melegakan kapasitas penyimpanan.",
            "path": target_path,
            "exists": os.path.exists(target_path)
        }

    # C. Corrupted / Old Profile Pattern
    if any(word in base_name for word in [".old", ".corrupted", ".bak", "backup", "_backup"]):
        return {
            "title": f"Cadangan / Profil Lama ({os.path.basename(target_path)})",
            "owner": "Aplikasi Terkait",
            "category": "review",
            "safety_score": 85,
            "safety_label": "🟡 Aman Dihapus Jika Profil Aktif Berjalan Normal",
            "summary": "Folder backup atau salinan profil yang rusak di masa lalu.",
            "purpose": "Dibuat saat aplikasi memperbarui profil atau saat terjadi error di masa lampau.",
            "if_deleted": "Aman jika aplikasi terkait saat ini sudah berjalan normal.",
            "recommendation": "Bisa dihapus jika Anda tidak membutuhkan data konfigurasi dari versi lama tersebut.",
            "path": target_path,
            "exists": os.path.exists(target_path)
        }

    # D. node_modules / build / dist in project folders
    if base_name in ["node_modules", "dist", "build", ".next", "target", "vendor"]:
        return {
            "title": f"Build Artifact / Dependency ({os.path.basename(target_path)})",
            "owner": "Proyek Pemrograman / Developer Tooling",
            "category": "review",
            "safety_score": 90,
            "safety_label": "🟡 Aman Dihapus (Bisa di-generate ulang)",
            "summary": "Folder dependensi atau hasil kompilasi dari proyek source code.",
            "purpose": "Menampung library modul atau file hasil build yang siap di-deploy.",
            "if_deleted": "Source code asli Anda tetap utuh. Anda bisa men-generate ulang folder ini dengan perintah build (misal: `npm install` atau `npm run build`).",
            "recommendation": "Bisa dihapus pada proyek-proyek lama yang sudah tidak aktif dikerjakan.",
            "path": target_path,
            "exists": os.path.exists(target_path)
        }

    # E. Generic Folder Fallback
    is_dir = os.path.isdir(target_path) if os.path.exists(target_path) else True
    return {
        "title": f"{'Folder' if is_dir else 'File'}: {os.path.basename(target_path)}",
        "owner": "Aplikasi Pengguna / Dokumen Pribadi",
        "category": "review",
        "safety_score": 60,
        "safety_label": "🟡 Periksa Terlebih Dahulu Sebelum Dihapus",
        "summary": f"Direktori data pengguna pada lokasi: {target_path}",
        "purpose": "Menyimpan data aplikasi, instalasi software, atau dokumen pribadi.",
        "if_deleted": "Pastikan Anda tidak membutuhkan file di dalamnya sebelum menghapus.",
        "recommendation": "Klik tombol 'Buka di Windows Explorer' untuk memeriksa isi file di dalamnya terlebih dahulu.",
        "path": target_path,
        "exists": os.path.exists(target_path)
    }
