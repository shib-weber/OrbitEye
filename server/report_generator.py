import io
import json
import math
import requests
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader

def lat_lon_to_tile_xy(lat: float, lon: float, zoom: int):
    """Converts WGS84 Lat/Lon to global fractional tile coordinates."""
    lat_rad = math.radians(lat)
    n = 2.0 ** zoom
    x = (lon + 180.0) / 360.0 * n
    y = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
    return x, y

def generate_static_map_image(center_lat: float, center_lon: float, clusters: list) -> io.BytesIO:
    """
    Stitches a multi-tile high-resolution Web Mercator map buffer (1040x480)
    and draws exact projected bounding boxes, GPS crosshairs, and inspection badges.
    """
    canvas_w, canvas_h = 1040, 480
    zoom = 15  # Optimal street & field parcel level zoom

    center_x, center_y = lat_lon_to_tile_xy(center_lat, center_lon, zoom)
    
    # Calculate tile ranges needed to fill the canvas
    tiles_x = 3
    tiles_y = 2
    
    top_left_tile_x = int(center_x - (tiles_x / 2.0))
    top_left_tile_y = int(center_y - (tiles_y / 2.0))
    
    stitched_img = Image.new("RGB", (tiles_x * 256, tiles_y * 256), color=(15, 23, 42))
    headers = {'User-Agent': 'OrbitEye-Inspector/2.0 (Municipal Risk Monitor)'}

    for ix in range(tiles_x):
        for iy in range(tiles_y):
            curr_tx = top_left_tile_x + ix
            curr_ty = top_left_tile_y + iy
            try:
                url = f"https://tile.openstreetmap.org/{zoom}/{curr_tx}/{curr_ty}.png"
                res = requests.get(url, headers=headers, timeout=2.5)
                if res.status_code == 200:
                    tile_data = Image.open(io.BytesIO(res.content)).convert("RGB")
                    stitched_img.paste(tile_data, (ix * 256, iy * 256))
            except Exception:
                pass

    # Crop stitched map around center_x, center_y to fit canvas_w, canvas_h
    center_px_in_stitched_x = (center_x - top_left_tile_x) * 256
    center_px_in_stitched_y = (center_y - top_left_tile_y) * 256

    crop_x1 = max(0, int(center_px_in_stitched_x - (canvas_w / 2)))
    crop_y1 = max(0, int(center_px_in_stitched_y - (canvas_h / 2)))
    crop_x2 = crop_x1 + canvas_w
    crop_y2 = crop_y1 + canvas_h

    final_map = stitched_img.crop((crop_x1, crop_y1, crop_x2, crop_y2))
    
    # Overlay Layer for semi-transparent polygons
    overlay = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    draw_overlay = ImageDraw.Draw(overlay)
    draw_final = ImageDraw.Draw(final_map)

    def geo_to_canvas_px(lat, lon):
        tx, ty = lat_lon_to_tile_xy(lat, lon, zoom)
        px = int((tx - top_left_tile_x) * 256 - crop_x1)
        py = int((ty - top_left_tile_y) * 256 - crop_y1)
        return px, py

    # 1. Draw Target Centroid Reference Crosshair
    cx, cy = canvas_w // 2, canvas_h // 2
    draw_final.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], outline=(2, 132, 199), width=3)
    draw_final.line([(cx - 18, cy), (cx + 18, cy)], fill=(2, 132, 199), width=2)
    draw_final.line([(cx, cy - 18), (cx, cy + 18)], fill=(2, 132, 199), width=2)

    # 2. Draw Anomaly Hotspot Bounding Boxes
    for idx, c in enumerate(clusters[:4]):
        bbox = c.get("bounding_box")
        c_id = c.get("cluster_id", idx + 1)
        is_critical = c.get("severity") == "CRITICAL" or c.get("confidence_score", 1.0) < 0.70

        border_color = (220, 38, 38) if is_critical else (217, 119, 6) # Red / Amber
        fill_color = (220, 38, 38, 70) if is_critical else (217, 119, 6, 70)

        if bbox and "north" in bbox and "south" in bbox:
            p1 = geo_to_canvas_px(bbox["north"], bbox["west"])
            p2 = geo_to_canvas_px(bbox["north"], bbox["east"])
            p3 = geo_to_canvas_px(bbox["south"], bbox["east"])
            p4 = geo_to_canvas_px(bbox["south"], bbox["west"])
            poly_pts = [p1, p2, p3, p4]
        else:
            # Fallback center-point buffer
            c_lat, c_lon = c.get("exact_center", [center_lat, center_lon])
            px, py = geo_to_canvas_px(c_lat, c_lon)
            bw, bh = 55, 35
            poly_pts = [(px - bw, py - bh), (px + bw, py - bh), (px + bw, py + bh), (px - bw, py + bh)]

        # Draw translucent polygon and strong perimeter border
        draw_overlay.polygon(poly_pts, fill=fill_color)
        draw_final.polygon(poly_pts, outline=border_color, width=3)

        # Draw Spot ID Badge
        top_x, top_y = poly_pts[0]
        badge_w, badge_h = 75, 20
        draw_final.rectangle([top_x, top_y - badge_h, top_x + badge_w, top_y], fill=border_color)
        draw_final.text((top_x + 4, top_y - badge_h + 3), f"HOTSPOT #{c_id}", fill=(255, 255, 255))

    # Merge alpha overlay into final basemap
    final_map.paste(Image.alpha_composite(final_map.convert("RGBA"), overlay).convert("RGB"))
    
    # 3. Add Top-Right Map Legend
    draw_final.rectangle([canvas_w - 230, 10, canvas_w - 10, 65], fill=(15, 23, 42), outline=(51, 65, 85), width=2)
    draw_final.rectangle([canvas_w - 220, 20, canvas_w - 200, 32], fill=(220, 38, 38))
    draw_final.text((canvas_w - 190, 18), "Critical Priority / Defect", fill=(255, 255, 255))
    draw_final.rectangle([canvas_w - 220, 42, canvas_w - 200, 54], fill=(217, 119, 6))
    draw_final.text((canvas_w - 190, 40), "Moderate / High Severity", fill=(255, 255, 255))

    img_buffer = io.BytesIO()
    final_map.save(img_buffer, format="PNG", quality=95)
    img_buffer.seek(0)
    return img_buffer

def generate_pdf_report(alert) -> io.BytesIO:
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # 1. Header Banner
    p.setFillColor(colors.HexColor("#0284C7"))
    p.rect(0, 710, 612, 90, fill=True, stroke=False)
    
    p.setFillColor(colors.white)
    p.setFont("Helvetica-Bold", 15)
    p.drawString(36, 760, "ORBITEYE | RURAL & URBAN RISK EVIDENCE DOSSIER")
    p.setFont("Helvetica", 9)
    p.drawString(36, 740, f"Automated Field Evidence Sheet • UID: #{alert.id} • SP-01 Verification Standard")
    
    # 2. Administrative Target
    p.setFillColor(colors.HexColor("#0F172A"))
    p.setFont("Helvetica-Bold", 10)
    p.drawString(36, 685, "1. Target Territory & Administrative Jurisdiction")
    p.setFont("Helvetica", 8.5)
    p.setFillColor(colors.HexColor("#334155"))
    p.drawString(46, 668, f"Territory / Municipality: {alert.village_name} | Ward/Sector: {alert.ward_no}")
    p.drawString(46, 654, f"Regional Center Coordinates: {alert.latitude:.5f}° N, {alert.longitude:.5f}° E | SCL Noise Mask: {alert.cloud_cover_percent}%")

    try:
        clusters = json.loads(alert.detected_issues)
    except:
        clusters = []

    # 3. High-Resolution Visual Map Snapshot (Exact 520x240 - 2.17:1 ratio matching canvas)
    p.setFont("Helvetica-Bold", 10)
    p.setFillColor(colors.HexColor("#0F172A"))
    p.drawString(36, 634, "2. Satellite Observation Footprint & Boxed Hotspots")

    map_img_buffer = generate_static_map_image(alert.latitude, alert.longitude, clusters)
    p.drawImage(ImageReader(map_img_buffer), 46, 425, width=520, height=195)

    # 4. Detailed Hotspot Inspection Breakdown
    y = 405
    p.setFont("Helvetica-Bold", 10)
    p.drawString(36, y, "3. Physical Sub-Location Hotspot Analytics")
    y -= 15

    for c in clusters[:3]:
        p.setFont("Helvetica-Bold", 8)
        p.setFillColor(colors.HexColor("#0284C7"))
        label = c.get('sub_location_label') or f"Sector ({alert.ward_no})"
        p.drawString(46, y, f"• Hotspot #{c.get('cluster_id')}: {c.get('issue')} [{label}]")
        y -= 11
        p.setFont("Helvetica", 7.5)
        p.setFillColor(colors.HexColor("#334155"))
        bbox = c.get("bounding_box", {})
        bbox_str = f"GPS BBox: [N: {bbox.get('north',0):.4f}°, S: {bbox.get('south',0):.4f}°, E: {bbox.get('east',0):.4f}°, W: {bbox.get('west',0):.4f}°]"
        p.drawString(56, y, f"{bbox_str} | Footprint: {c.get('area_sq_meters',0):,.0f} m² | Priority: {c.get('priority', 'NORMAL')}")
        y -= 11
        p.drawString(56, y, f"Spectral Delta: {c.get('spectral_explanation', 'Reflectance anomaly confirmed.')}")
        y -= 13

    # 5. AI Civil Inspector Action Directives
    p.setFont("Helvetica-Bold", 10)
    p.setFillColor(colors.HexColor("#0F172A"))
    p.drawString(36, y - 2, "4. AI Municipal Inspector Action Directives")
    y -= 15
    p.setFont("Helvetica", 8)
    p.setFillColor(colors.HexColor("#1E293B"))
    notes = alert.ai_inspector_notes or "Field inspection required."
    p.drawString(46, y, f"Diagnostic: {notes[:115]}...")
    y -= 11
    mitigation = alert.ai_mitigation_plan or "Conduct immediate physical ground survey."
    p.drawString(46, y, f"Directive: {mitigation[:115]}...")

    # 6. Field Sign-Off Box
    y -= 22
    p.setStrokeColor(colors.HexColor("#94A3B8"))
    p.rect(36, y - 50, 540, 60, stroke=1, fill=0)
    p.setFillColor(colors.HexColor("#0F172A"))
    p.setFont("Helvetica-Bold", 8.5)
    p.drawString(46, y - 10, "Ground Verification & Executive Authorization Sign-Off:")
    p.setFont("Helvetica", 7.5)
    p.setFillColor(colors.HexColor("#64748B"))
    p.drawString(46, y - 25, "Field Inspection Outcome:   [  ] CONFIRMED PHYSICAL HAZARD      [  ] SENSOR NOISE / FALSE ALARM")
    p.drawString(46, y - 42, "Field Inspector Signature: _______________________          Inspection Date: _______________")
    
    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer