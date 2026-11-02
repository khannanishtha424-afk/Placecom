import os
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import (
    auth_router,
    periods_router,
    student_router,
    management_router,
    export_router
)
from app.seed import seed_database

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="HSB Student Development Program (SDP) Management System — Placement Committee Batch 2026–28"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router.router, prefix=settings.API_V1_STR)
app.include_router(periods_router.router, prefix=settings.API_V1_STR)
app.include_router(student_router.router, prefix=settings.API_V1_STR)
app.include_router(management_router.router, prefix=settings.API_V1_STR)
app.include_router(export_router.router, prefix=settings.API_V1_STR)

# Mount Static Files
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Mount Lumina Deep Academy 3D LMS
lumina_dist = os.path.join(os.path.dirname(__file__), "client", "dist")
if os.path.exists(lumina_dist):
    from fastapi.responses import RedirectResponse
    app.mount("/lumina-app", StaticFiles(directory=lumina_dist, html=True), name="lumina-app")

    @app.get("/lumina")
    def serve_lumina():
        return RedirectResponse(url="/lumina-app/")

@app.on_event("startup")
def on_startup():
    try:
        seed_database()
    except Exception as e:
        print(f"Startup seed notice: {e}")

@app.get("/", response_class=FileResponse)
def serve_index():
    return FileResponse(os.path.join(static_dir, "index.html"))

@app.get("/student", response_class=FileResponse)
def serve_student_portal():
    return FileResponse(os.path.join(static_dir, "student.html"))

@app.get("/management", response_class=FileResponse)
def serve_management_dashboard():
    return FileResponse(os.path.join(static_dir, "management.html"))

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "cohort": settings.COHORT_NAME,
        "batch_size": settings.DEFAULT_BATCH_SIZE,
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)
