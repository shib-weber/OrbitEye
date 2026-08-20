import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "").strip()

def generate_inspector_dossier(village: str, ward: str, lat: float, lon: float, issues: list, area: float, crack_density: float = None) -> dict:
    """
    Acts as an automated Civil Engineer & Geospatial Municipal Inspector.
    Generates root-cause diagnostic assessments and concrete field mitigation directives.
    """
    # Safe extraction with fallback for severity/priority keys
    formatted_issues = []
    for i in issues:
        issue_name = i.get("issue", "Infrastructure Anomaly")
        # Support either 'severity', 'priority', or fallback to 'HIGH'
        sev = i.get("severity") or i.get("priority") or ("HIGH" if i.get("confidence_score", 1.0) < 0.7 else "MODERATE")
        formatted_issues.append(f"{issue_name} ({sev})")

    issues_summary = ", ".join(formatted_issues) if formatted_issues else "General Regional Anomaly"
    crack_info = f"Ground Surface Defect: {crack_density}% crack density detected." if crack_density else "No ground-level crack data yet."

    prompt = f"""
    You are the Chief Geospatial & Civil Infrastructure Inspector for rural and municipal governance.
    Analyze this automated satellite observation:
    - Territory: {village}, Ward: {ward} (Coordinates: {lat:.5f} N, {lon:.5f} E)
    - Primary Issues Detected: {issues_summary}
    - Total Affected Footprint: {area:,.2f} sq. meters
    - {crack_info}

    Provide a concise, professional, structured municipal report in valid JSON with these exact keys:
    1. "diagnostic_summary": Detailed technical explanation (2-3 sentences) of why this is happening (e.g. soil liquefaction, illegal landfill, monsoon runoff obstruction).
    2. "immediate_action": Urgent on-site mandate for the field verification team within 24-48 hours.
    3. "long_term_mitigation": Engineering/policy solution (e.g., RCC culvert reinforcement, canal de-silting, GIS buffer zone zoning).
    4. "risk_level": One of ["CRITICAL", "HIGH", "MODERATE", "LOW"].
    """

    if GEMINI_KEY:
        try:
            client = genai.Client(api_key=GEMINI_KEY)
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config={
                    'response_mime_type': 'application/json'
                }
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini API error (fallback triggered): {e}")

    # Robust local reasoning fallback
    is_critical = any(
        i.get("severity") == "CRITICAL" or i.get("priority", "").startswith("HIGH") or i.get("confidence_score", 1.0) < 0.65 
        for i in issues
    ) or (crack_density and crack_density > 2.0)

    risk_level = "CRITICAL" if is_critical else "HIGH" if len(issues) > 1 else "MODERATE"

    return {
        "diagnostic_summary": f"Multi-spectral analysis at {village} ({ward}) indicates composite environmental stress. Spectral deviation across {area:,.0f} m² correlates with {issues_summary.lower()}. Unregulated surface drainage or localized soil compaction is accelerating structural vulnerability.",
        "immediate_action": "Deploy Block Development Officer (BDO) field unit with GPS cameras. Enforce temporary halt on heavy vehicular movement and inspect adjacent drainage embankments for blockages.",
        "long_term_mitigation": "Install reinforced concrete culverts to restore hydraulic continuity, enforce a 50-meter buffer zone along water conduits, and establish periodic bi-weekly satellite SAR ground-deformation tracking.",
        "risk_level": risk_level
    }