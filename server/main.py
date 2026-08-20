import json
from fastapi import FastAPI, Depends, HTTPException, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from database import Base, engine, get_db
from models import RiskAlert
from change_detector import run_satellite_analysis
from crack_detector import analyze_surface_damage
from ai_inspector import generate_inspector_dossier
from report_generator import generate_pdf_report

Base.metadata.create_all(bind=engine)

app = FastAPI(title="OrbitEye API", version="4.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    village_name: str = Field(..., min_length=1)
    ward_no: str = Field(..., min_length=1)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)

@app.get("/api/alerts")
def fetch_all_alerts(db: Session = Depends(get_db)):
    return db.query(RiskAlert).order_by(RiskAlert.id.desc()).all()

@app.post("/api/scan")
def trigger_satellite_scan(payload: ScanRequest, db: Session = Depends(get_db)):
    results = run_satellite_analysis(payload.latitude, payload.longitude)
    
    ai_dossier = generate_inspector_dossier(
        village=payload.village_name,
        ward=payload.ward_no,
        lat=payload.latitude,
        lon=payload.longitude,
        issues=results["all_clusters"],
        area=results["total_area_sqm"]
    )

    new_alert = RiskAlert(
        village_name=payload.village_name,
        ward_no=payload.ward_no,
        latitude=payload.latitude,
        longitude=payload.longitude,
        change_type=results["primary_issue"],
        detected_issues=json.dumps(results["all_clusters"]),
        area_sq_meters=results["total_area_sqm"],
        confidence_score=results["average_confidence"],
        cloud_cover_percent=results["cloud_cover_percent"],
        ai_inspector_notes=ai_dossier.get("diagnostic_summary"),
        ai_mitigation_plan=f"Immediate: {ai_dossier.get('immediate_action')} | Long-Term: {ai_dossier.get('long_term_mitigation')}"
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return new_alert

@app.patch("/api/alerts/{alert_id}/status")
def update_alert_status(alert_id: int, status: str, db: Session = Depends(get_db)):
    alert = db.query(RiskAlert).filter(RiskAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = status
    db.commit()
    return {"id": alert.id, "status": alert.status}

@app.post("/api/alerts/{alert_id}/crack-inspect")
async def inspect_crack(alert_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    alert = db.query(RiskAlert).filter(RiskAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    img_bytes = await file.read()
    analysis = analyze_surface_damage(img_bytes)
    
    if "error" in analysis:
        raise HTTPException(status_code=400, detail=analysis["error"])
        
    alert.crack_density = analysis["crack_density_percentage"]
    alert.crack_severity = analysis["severity"]

    try:
        clusters = json.loads(alert.detected_issues)
    except:
        clusters = [{"issue": alert.change_type, "severity": "HIGH"}]

    ai_dossier = generate_inspector_dossier(
        village=alert.village_name,
        ward=alert.ward_no,
        lat=alert.latitude,
        lon=alert.longitude,
        issues=clusters,
        area=alert.area_sq_meters,
        crack_density=alert.crack_density
    )
    alert.ai_inspector_notes = ai_dossier.get("diagnostic_summary")
    alert.ai_mitigation_plan = f"Immediate: {ai_dossier.get('immediate_action')} | Long-Term: {ai_dossier.get('long_term_mitigation')}"

    db.commit()
    return analysis

@app.get("/api/alerts/{alert_id}/pdf")
def download_evidence_pdf(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(RiskAlert).filter(RiskAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    pdf_buffer = generate_pdf_report(alert)
    return Response(
        content=pdf_buffer.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=OrbitEye_Report_{alert.id}.pdf"}
    )