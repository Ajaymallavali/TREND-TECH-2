import asyncio
import json

async def run():
    try:
        # Import the mcp server tools directly
        from codegraph.mcp.server import get_architecture, reconcile_static_runtime, ingest_runtime_traces
        
        # Test architecture
        arch = get_architecture()
        print("Architecture Data:", json.dumps(arch, indent=2)[:500])
        
        # Test reconcile
        recon = reconcile_static_runtime(symbol="getProducts")
        print("Reconciliation:", json.dumps(recon, indent=2))
        
    except Exception as e:
        print("Error:", e)

asyncio.run(run())
