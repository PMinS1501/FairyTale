#!/bin/bash

# -------------------------------
# FastAPI 서버 종료
# -------------------------------

# 8000번 포트를 사용하는 모든 프로세스를 찾기
PIDS=$(lsof -t -i:8000)

if [ -z "$PIDS" ]; then
  echo "[!] 8000번 포트를 사용하는 프로세스가 없습니다."
else
  echo "[*] FastAPI 서버 종료 중 (PID: $PIDS)..."
  kill $PIDS
  echo "[✓] FastAPI 서버가 종료되었습니다."
fi