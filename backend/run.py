import os
import sys
import uvicorn

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, base_dir)
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Launching Khet2Kart Python Backend on port {port}...")

    # Only watch routers and services, explicitly ignoring venv, node_modules, and data
    routers_dir = os.path.join(base_dir, "routers")
    services_dir = os.path.join(base_dir, "services")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        reload_dirs=[base_dir],
        reload_includes=["*.py"],
        reload_excludes=["*venv*", "*node_modules*", "*data*", "*.json", "*.log"],
    )
