import asyncio
import json
from codegraph.mcp.cli import _app

async def dump_tools():
    # Attempt to use the FastMCP instance
    try:
        from codegraph.mcp.server import mcp
        tools = mcp.list_tools()
        names = [t.name for t in tools]
        print(json.dumps(names, indent=2))
        return
    except Exception as e:
        pass
        
    try:
        from codegraph.mcp.app import mcp
        tools = mcp.list_tools()
        names = [t.name for t in tools]
        print(json.dumps(names, indent=2))
        return
    except Exception as e:
        pass

    try:
        from codegraph.mcp.fast_mcp import app
        tools = await app.get_tools()
        names = [t.name for t in tools]
        print(json.dumps(names, indent=2))
        return
    except Exception as e:
        pass

    # If all else fails, use the CLI
    import subprocess
    print("Cannot import directly. Trying capabilities.")

if __name__ == "__main__":
    asyncio.run(dump_tools())
