# 1. 시작하기 전
가상환경 활성화 해야함 (.venv/)
```bash
source ./.venv/bin/activate
```

# 2. 이후 MCP server 실행

Run with streamable-http transport on default port (6000):
```bash
python ./mcp-server/mcp_server.py --transport streamable-http
```

# 3. client 실행
```bash
uv run ./mcp-server/client.py
```



# **의존성 라이브러리 추가 후**
uv sync로 라이브러리 충돌 확인해야 함