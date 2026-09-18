import os
import sys
from datetime import datetime, timezone
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Ensure current directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from routers import auth, listings, orders, logistics, platform, inventory, hubs, admin
from dependencies import get_current_user, require_role
from fastapi import Depends

app = FastAPI(
    title="Khet2Kart Python Backend",
    description="High-performance Python backend for Khet2Kart Farm-to-Fork platform with real SMS OTP verification and live inventory management.",
    version="2.0.0",
)

# Custom exception handlers to provide { success: false, error: "..." } matching frontend expectations
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        locs = [str(x) for x in err.get("loc", []) if x != "body"]
        field = ".".join(locs)
        msg = err.get("msg", "Validation error")
        if msg.startswith("Value error, "):
            msg = msg[len("Value error, "):]
        errors.append(f"{field}: {msg}" if field else msg)
    return JSONResponse(
        status_code=400,
        content={"success": False, "error": "; ".join(errors)},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": str(exc.detail)},
    )


# Enable CORS for React frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "khet2kart-python-backend",
        "runtime": "Python FastAPI",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

# Mount modular routers
# We secure all domain routes with JWT authentication.
domain_deps = [Depends(get_current_user)]
admin_deps = [Depends(require_role(["ADMIN"]))]

app.include_router(auth.router, prefix="/api/auth") # Auth routes like permissions might need to be public or handled separately
app.include_router(listings.router, prefix="/api", dependencies=domain_deps)
app.include_router(orders.router, prefix="/api", dependencies=domain_deps)
app.include_router(logistics.router, prefix="/api", dependencies=domain_deps)
app.include_router(inventory.router, prefix="/api", dependencies=domain_deps)
app.include_router(hubs.router, prefix="/api", dependencies=domain_deps)
app.include_router(admin.router, prefix="/api", dependencies=admin_deps)
app.include_router(platform.router, prefix="/api", dependencies=domain_deps)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5000))
    print(f"🌾 Khet2Kart Python Backend starting on http://127.0.0.1:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
