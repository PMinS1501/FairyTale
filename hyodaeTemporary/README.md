# 시작하기 전
가상환경 활성화 해야함 (.venv/)

source ./.venv/bin/activate

# 이후 MCP server 실행

Run with streamable-http transport on default port (8000):

python mcp_server.py --transport streamable-http

# client 실행
uv run client_streamablehttp.py



# 의존성 라이브러리 추가 후
uv sync로 라이브러리 충돌 확인해야 함