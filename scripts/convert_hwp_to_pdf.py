import os
import argparse
import json

def get_files(input_dir, recursive=True):
    hwp_files = []
    if recursive:
        for root, dirs, files in os.walk(input_dir):
            for f in files:
                if f.lower().endswith(('.hwp', '.hwpx')) and not f.startswith('~$'):
                    hwp_files.append(os.path.join(root, f))
    else:
        for f in os.listdir(input_dir):
            if f.lower().endswith(('.hwp', '.hwpx')) and not f.startswith('~$'):
                full_path = os.path.join(input_dir, f)
                if os.path.isfile(full_path):
                    hwp_files.append(full_path)
    return hwp_files

def is_excluded(filepath):
    keywords = ["수학상", "수학(상)", "수학_상", "수학 상", "고등수학(상)", "고등수학 상"]
    path_str = filepath
    for kw in keywords:
        if kw in path_str:
            return True
    return False

def main():
    parser = argparse.ArgumentParser(description="HWP to PDF Automator")
    parser.add_argument('--input', required=True, help="Input root directory")
    parser.add_argument('--output', required=True, help="Output PDF directory")
    parser.add_argument('--recursive', action='store_true', default=True, help="Scan subdirectories")
    parser.add_argument('--skip-existing', action='store_true', default=True, help="Skip if PDF exists")
    parser.add_argument('--dry-run', action='store_true', help="Print scan results without executing converter")
    args = parser.parse_args()

    print(f"\n[SCAN] 디렉터리 스캔 중...: {args.input}")
    
    all_files = get_files(args.input, args.recursive)
    
    targets = []
    excluded = []
    skipped_existing = 0
    failed_files = []
    
    for src in all_files:
        if is_excluded(src):
            excluded.append(src)
            continue
            
        rel_path = os.path.relpath(src, args.input)
        base, _ = os.path.splitext(rel_path)
        dest_pdf = os.path.join(args.output, base + ".pdf")
        
        if args.skip_existing and os.path.exists(dest_pdf):
            skipped_existing += 1
            continue
            
        targets.append({
            "Source": src,
            "Target": dest_pdf
        })

    print("======================================")
    print(" DRY-RUN SCAN RESULTS" if args.dry_run else " SCAN RESULTS")
    print("======================================")
    print(f"총 발견된 HWP/HWPX 파일 수: {len(all_files)}")
    print(f"제외된 '수학(상)' 관련 파일 수: {len(excluded)}")
    print(f"이미 존재하는 PDF 스킵 수: {skipped_existing}")
    print(f"\n[실제 변환 대기 중인 파일 수]: {len(targets)}")

    print("\n[최초 5개 변환 대상 확인]")
    for i in range(min(5, len(targets))):
        print(f" - {targets[i]['Source']}  =>  {targets[i]['Target']}")
    
    print("\n[최초 5개 제외 대상 (수학상) 확인]")
    for i in range(min(5, len(excluded))):
        print(f" - {excluded[i]}")

    report = {
        "total_files": len(all_files),
        "excluded_math_high": len(excluded),
        "skipped_existing_pdfs": skipped_existing,
        "target_conversion_count": len(targets),
        "converted_count": 0,
        "failed_files": []
    }

    if args.dry_run:
        print("\n[Dry-run 완료] 변환 모형에 이상이 없다면 --dry-run 없이 다시 실행하세요.")
        with open("c:/mentos_os_clean/scratch/summary_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=4, ensure_ascii=False)
        return

    # Execute actual convert
    print("\n[START] 한글 프로그램(HWP) 자동화 구동을 시작합니다...")
    try:
        import win32com.client
    except ImportError:
        print("[ERROR] pywin32 설치가 필요합니다: pip install pywin32")
        return

    try:
        hwp = win32com.client.gencache.EnsureDispatch("HWPFrame.HwpObject")
        hwp.RegisterModule("FilePathCheckDLL", "FilePathCheckerModule") # Bypass security prompts if possible
    except Exception as e:
        print(f"[ERROR] 한글(HWP) 프로그램을 불러올 수 없습니다. 한글이 설치되어 있는지 확인하세요. ({e})")
        return

    success_count = 0
    import time
    for item in targets:
        src = item["Source"]
        dest = item["Target"]
        
        dest_dir = os.path.dirname(dest)
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
            
        print(f" -> 변환 중: {os.path.basename(src)}")
        try:
            # open file
            hwp.Open(src, "HWP", "forceopen:true;")
            
            # format and save as pdf
            hwp.SaveAs(dest, "PDF")
            success_count += 1
            hwp.Run("FileClose")
            
        except Exception as e:
            print(f"   [EXCEPTION] {e}")
            failed_files.append(src)
    
    hwp.Quit()
    
    report["converted_count"] = success_count
    report["failed_files"] = failed_files
    
    with open("c:/mentos_os_clean/scratch/summary_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=4, ensure_ascii=False)

    print("\n======================================")
    print(" COMPLETE REPORT")
    print("======================================")
    print(f"변환 성공: {success_count} / {len(targets)}")
    if failed_files:
        print(f"변환 실패: {len(failed_files)} 개")
    print("\n최종 요약은 summary_report.json에 저장되었습니다.")

if __name__ == "__main__":
    main()
