import os
import subprocess
from typing import List, Optional
from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from scanner import get_drives_info, scan_directory_tree, format_size
from advisor import get_smart_recommendations
from cleaner import clean_selected_recommendations, delete_target_path, empty_windows_recycle_bin
from explainer import analyze_directory_purpose

app = FastAPI(
    title="DiskLens API",
    description="Smart Disk Analyzer & Cleanup Advisor API",
    version="1.0.0"
)

# Enable CORS for local development with Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CleanRequest(BaseModel):
    paths: List[str]
    use_recycle_bin: bool = True

class OpenFolderRequest(BaseModel):
    path: str

class ExplainPathRequest(BaseModel):
    path: str

@app.post("/api/explain-path")
def explain_path(req: ExplainPathRequest):
    """Explain purpose, owner, safety score, and impact of deleting any directory."""
    try:
        explanation = analyze_directory_purpose(req.path)
        return explanation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/drives")
def get_drives():
    """Get all connected storage drives with usage stats."""
    try:
        drives = get_drives_info()
        return {"drives": drives}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scan")
def scan_path(path: str = Query(..., description="Directory path to scan"), depth: int = Query(2, ge=1, le=5)):
    """Perform hierarchical disk space scan."""
    try:
        tree = scan_directory_tree(path, max_depth=depth)
        return tree
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommendations")
def get_recommendations(drive: str = Query("C", description="Drive letter to analyze")):
    """Get smart cleanup recommendations categorized into Safe, Review, and Protected."""
    try:
        data = get_smart_recommendations(drive_letter=drive)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/clean")
def clean_items(req: CleanRequest):
    """Safely delete selected paths with Recycle Bin support."""
    if not req.paths:
        raise HTTPException(status_code=400, detail="No paths provided for cleaning.")
    
    result = clean_selected_recommendations(req.paths, use_recycle_bin=req.use_recycle_bin)
    return result

@app.post("/api/empty-recycle-bin")
def empty_recycle_bin_route():
    """Empty Windows Recycle Bin across all drives to instantly reclaim storage."""
    try:
        res = empty_windows_recycle_bin()
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/open-folder")
def open_in_explorer(req: OpenFolderRequest):
    """Open target directory or select file in Windows File Explorer."""
    target = os.path.abspath(req.path)
    if not os.path.exists(target):
        raise HTTPException(status_code=404, detail="Path does not exist")
    
    try:
        if os.path.isfile(target):
            subprocess.Popen(f'explorer /select,"{target}"')
        else:
            subprocess.Popen(f'explorer "{target}"')
        return {"status": "opened", "path": target}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount frontend build static directory if available
dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    def serve_index():
        return FileResponse(os.path.join(dist_dir, "index.html"))
    
    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = os.path.join(dist_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    def serve_root():
        return {
            "name": "DiskLens API",
            "status": "running",
            "message": "Frontend not built yet. Run 'npm run build' in the frontend directory."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
