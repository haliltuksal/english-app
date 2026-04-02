#!/usr/bin/env python3
"""
English Coach — Local iOS Build + TestFlight Submit
Kullanim: python3 scripts/build-and-submit.py
"""

import subprocess
import sys
import os
import time
import glob

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def run(cmd, cwd=None, check=True, capture=False):
    print(f"\n{'='*60}")
    print(f"▶ {cmd}")
    print(f"{'='*60}\n")
    result = subprocess.run(
        cmd, shell=True, cwd=cwd or PROJECT_DIR,
        check=check, capture_output=capture, text=True
    )
    return result

def main():
    print("\n🚀 English Coach — Local Build + TestFlight\n")

    # Step 1: Check prerequisites
    print("📋 Onkosuller kontrol ediliyor...")
    try:
        run("which eas", capture=True)
    except:
        print("❌ EAS CLI bulunamadi. Yukleyin: npm install -g eas-cli")
        sys.exit(1)

    try:
        run("xcodebuild -version", capture=True)
    except:
        print("❌ Xcode bulunamadi. Xcode yuklu olmali.")
        sys.exit(1)

    # Step 2: Git check
    print("\n📦 Git durumu kontrol ediliyor...")
    result = run("git status --porcelain", capture=True, check=False)
    if result.stdout.strip():
        print("⚠️  Commit edilmemis degisiklikler var:")
        print(result.stdout[:500])
        answer = input("\nDevam etmek istiyor musunuz? (e/h): ").strip().lower()
        if answer != "e":
            print("Iptal edildi.")
            sys.exit(0)

    # Step 3: Ensure signing certificates are valid
    print("\n🔑 Sertifikalar kontrol ediliyor...")
    cert_check = run("security find-identity -v -p codesigning", capture=True, check=False)
    if "0 valid identities" in cert_check.stdout:
        print("⚠️  Gecerli codesigning sertifikasi bulunamadi!")
        print("   Xcode > Settings > Accounts > Apple ID'nizi ekleyin")
        print("   sonra Manage Certificates > + > Apple Distribution")
        sys.exit(1)
    else:
        print("   ✅ Codesigning sertifikasi mevcut")

    # Allow security tools to access keychain without prompts
    run("security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k \"\" ~/Library/Keychains/login.keychain-db 2>/dev/null || true", check=False, capture=True)

    # Step 4: Local build
    print("\n🔨 Local iOS build baslatiliyor...")
    print("   Bu islem 10-20 dakika surebilir.\n")

    start_time = time.time()
    try:
        run("npx eas build --platform ios --profile production --local --non-interactive")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Build basarisiz! (exit code: {e.returncode})")
        sys.exit(1)

    elapsed = int(time.time() - start_time)
    print(f"\n✅ Build tamamlandi! ({elapsed // 60}dk {elapsed % 60}sn)")

    # Step 5: Find .ipa file
    print("\n🔍 IPA dosyasi araniyor...")
    ipa_patterns = [
        os.path.join(PROJECT_DIR, "*.ipa"),
        os.path.join(PROJECT_DIR, "build", "*.ipa"),
        os.path.join(os.path.expanduser("~"), "*.ipa"),
    ]

    ipa_file = None
    for pattern in ipa_patterns:
        files = glob.glob(pattern)
        if files:
            ipa_file = max(files, key=os.path.getmtime)
            break

    if not ipa_file:
        print("❌ IPA dosyasi bulunamadi!")
        ipa_file = input("IPA dosya yolunu manuel girin: ").strip()
        if not os.path.exists(ipa_file):
            print("❌ Dosya bulunamadi!")
            sys.exit(1)

    print(f"   📱 IPA: {ipa_file}")
    print(f"   📊 Boyut: {os.path.getsize(ipa_file) / (1024*1024):.1f} MB")

    # Step 6: Submit to TestFlight
    print("\n📤 TestFlight'a gonderiliyor...")
    print("   EAS Submit kullanilacak.\n")

    try:
        run(f'npx eas submit --platform ios --path "{ipa_file}" --non-interactive')
    except subprocess.CalledProcessError:
        print("\n⚠️  EAS Submit basarisiz oldu. Manuel gonderim deneyin:")
        print(f"   npx eas submit --platform ios --path \"{ipa_file}\"")
        sys.exit(1)

    total_elapsed = int(time.time() - start_time)
    print(f"\n{'='*60}")
    print(f"✅ TestFlight'a basariyla gonderildi!")
    print(f"   Toplam sure: {total_elapsed // 60}dk {total_elapsed % 60}sn")
    print(f"   Apple Connect'te islenmesi birkac dakika surebilir.")
    print(f"{'='*60}\n")

    # Cleanup
    answer = input("IPA dosyasini silmek ister misiniz? (e/h): ").strip().lower()
    if answer == "e":
        os.remove(ipa_file)
        print("🗑️  IPA silindi.")

if __name__ == "__main__":
    main()
