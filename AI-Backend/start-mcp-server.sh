# 가상환경 활성화 (target: .venv/)
source ./.venv/bin/activate

# 이후 MCP server 실행(6000 번 포트)
python ./mcp-server/mcp_server.py --transport streamable-http