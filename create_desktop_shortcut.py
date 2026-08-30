import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def create_shortcut():
    # User's Desktop directory
    desktop_dir = os.path.join(os.path.expanduser("~"), "Desktop")
    if not os.path.exists(desktop_dir):
        # Alternative for OneDrive or localized Desktop
        desktop_dir = "D:\\Hype 5 AMD\\Desktop"
        if not os.path.exists(desktop_dir):
            desktop_dir = os.path.join(os.path.expanduser("~"), "OneDrive", "Desktop")

    shortcut_path = os.path.join(desktop_dir, "DiskLens.lnk")
    target_bat = os.path.abspath("D:\\Proyek\\disklens\\start.bat")
    icon_path = os.path.abspath("D:\\Proyek\\disklens\\disklens.ico")
    working_dir = os.path.abspath("D:\\Proyek\\disklens")

    # Use PowerShell COM WScript.Shell
    ps_cmd = f"""
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut('{shortcut_path}')
    $Shortcut.TargetPath = '{target_bat}'
    $Shortcut.WorkingDirectory = '{working_dir}'
    $Shortcut.IconLocation = '{icon_path},0'
    $Shortcut.Description = 'DiskLens — Smart Disk Usage Analyzer & Cleanup Advisor'
    $Shortcut.Save()
    """

    import subprocess
    cmd = ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps_cmd]
    subprocess.run(cmd, check=True)
    print(f"✅ Shortcut successfully created at: {shortcut_path}")
    print(f"   Target: {target_bat}")
    print(f"   Icon: {icon_path}")

if __name__ == "__main__":
    create_shortcut()
