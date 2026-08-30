import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from scanner import get_drives_info, scan_directory_tree
from advisor import get_smart_recommendations
from cleaner import is_path_safe_to_delete

def run_tests():
    print("=== 1. Testing get_drives_info ===")
    drives = get_drives_info()
    print(f"Detected {len(drives)} drives:")
    for d in drives:
        print(f"  Drive {d['letter']}: ({d['label']}) -> Free: {d['free_formatted']} ({d['free_percent']}%)")
    assert len(drives) >= 2, "Expected at least 2 drives (C: and D:)"

    print("\n=== 2. Testing get_smart_recommendations ===")
    rec = get_smart_recommendations('C')
    summary = rec["summary"]
    print(f"Safe Reclaimable: {summary['total_safe_formatted']}")
    print(f"Review Reclaimable: {summary['total_review_formatted']}")
    print(f"Total Reclaimable: {summary['total_reclaimable_formatted']}")
    
    print("\n🟢 Safe Zone Items:")
    for item in rec['recommendations']['safe']:
        print(f"  • {item['title']}: {item['total_formatted']}")

    print("\n🟡 Review Zone Items:")
    for item in rec['recommendations']['review']:
        print(f"  • {item['title']}: {item['total_formatted']}")

    print("\n🔴 Protected Zone Items:")
    for item in rec['recommendations']['protected']:
        print(f"  • {item['title']}: {item['total_formatted']}")

    print("\n=== 3. Testing Security Protection Barrier ===")
    assert not is_path_safe_to_delete("C:\\Windows"), "System Windows must be protected!"
    assert not is_path_safe_to_delete("C:\\pagefile.sys"), "pagefile.sys must be protected!"
    assert not is_path_safe_to_delete("C:\\"), "Root drive must be protected!"
    assert is_path_safe_to_delete(os.path.join(os.environ.get("LOCALAPPDATA", ""), "Temp")), "Temp should be deletable"
    print("Security barrier test passed: All critical paths strictly protected!")

    print("\n=== 5. Testing Directory Explainer Intelligence ===")
    from explainer import analyze_directory_purpose
    sample_tests = [
        "C:\\Users\\Hype 5 AMD\\AppData\\Local\\AMD\\DxCache",
        "C:\\Users\\Hype 5 AMD\\AppData\\Local\\D3DSCache",
        "C:\\Windows",
        "D:\\Capcut",
        "C:\\Users\\Hype 5 AMD\\AppData\\Local\\Temp"
    ]
    for p in sample_tests:
        exp = analyze_directory_purpose(p)
        print(f"  • {p}")
        print(f"    -> [{exp['safety_label']}] {exp['title']} (Owner: {exp['owner']})")
        assert 'title' in exp and 'if_deleted' in exp

    print("\n🎉 ALL TESTS INCLUDING EXPLAINER PASSED SUCCESSFULLY! 🚀")

if __name__ == "__main__":
    run_tests()
