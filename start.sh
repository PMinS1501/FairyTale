#!/bin/bash

# -------------------------------
# 설정
# -------------------------------

# 클론할 Git 레포 주소
REPO_URL="https://github.com/PMinS1501/FairyTale.git"

# 레포 이름 (폴더 이름)
REPO_NAME="FairyTale"

# -------------------------------
# 1. Git clone (특정 브랜치만 클론)
# -------------------------------

if [ ! -d "../$REPO_NAME" ]; then
  echo "[+] Git 레포가 없어서 클론합니다: $REPO_URL"
  git clone --single-branch --branch Backend-0.0.1 "$REPO_URL" "../$REPO_NAME"
else
  echo "[✓] Git 레포가 현재 경로에 이미 존재합니다."
fi

# -------------------------------
# 2. Git pull (변경사항 반영)
# -------------------------------

cd "../$REPO_NAME" || exit 1
echo "[*] Git 변경사항 확인 및 pull..."
git pull --ff-only origin Backend-0.0.1 # 백엔드 브랜치: Backend-0.0.1

# -------------------------------
# 3. 가상환경 생성 및 활성화
# -------------------------------

echo "[*] Using Python: $(which python3)"

cd - > /dev/null  # 원래 경로로 되돌아옴
if [ ! -d "venv" ]; then
  echo "[+] Creating virtual environment..."
  python3 -m venv venv
fi

# 운영체제별 가상환경 activate
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
  # Windows Git Bash
  echo "[+] Create windows venv"
  source venv/Scripts/activate
else
  # Linux/macOS
  echo "[+] Create Linux/macOS venv"
  source venv/bin/activate
fi

# -------------------------------
# 4. 의존성 설치
# -------------------------------

pip3 install --upgrade pip
pip3 install -r requirements.txt

# -------------------------------
# 5. FastAPI 서버 실행
# -------------------------------

echo "[🚀] FastAPI 서버 시작 중..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000