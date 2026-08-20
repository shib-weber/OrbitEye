import cv2
import numpy as np

def analyze_surface_damage(image_bytes: bytes) -> dict:
    """
    Inspects asphalt / concrete road surfaces for structural cracks and potholes using Canny & Adaptive Thresholding.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return {"error": "Invalid image payload"}

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    thresh = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2
    )
    edges = cv2.Canny(thresh, 50, 150)
    
    crack_pixels = int(np.count_nonzero(edges))
    total_pixels = edges.shape[0] * edges.shape[1]
    crack_ratio = float((crack_pixels / total_pixels) * 100)

    if crack_ratio > 3.8:
        severity = "CRITICAL_STRUCTURAL_DAMAGE"
    elif crack_ratio > 1.2:
        severity = "MODERATE_SURFACE_FRACTURE"
    else:
        severity = "MINOR_SURFACE_WEAR"

    return {
        "crack_density_percentage": round(crack_ratio, 2),
        "severity": severity,
        "requires_immediate_action": crack_ratio > 2.0
    }