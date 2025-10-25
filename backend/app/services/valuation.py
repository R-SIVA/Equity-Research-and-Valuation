from app.services.ratios import compute_ratios_single
from app.services.ingest import load_company_df, load_peers
import pandas as pd

# ---- P/B valuation ----
def compute_pb_target(peer_avg_pb=None):
    ratios = compute_ratios_single()
    if ratios is None or ratios.empty:
        return {
            "error": "No data available",
            "peer_avg_pb": None,
            "bvps": None,
            "target_price": None,
            "current_price": None,
            "recommendation": None
        }
    # print(ratios)
    # latest = ratios[-1]  # Get the last record
    latest = ratios.sort_values('period_end').iloc[-1]
    bvps = latest.get('bvps')
    
    if bvps is None:
        return {
            "error": "BVPS not available",
            "peer_avg_pb": None,
            "bvps": None,
            "target_price": None,
            "current_price": None,
            "recommendation": None
        }

    if peer_avg_pb is None:
        peers = load_peers()
        if peers:
            valid_ratios = [p['pb_ratio'] for p in peers if pd.notna(p.get('pb_ratio'))]
            peer_avg_pb = sum(valid_ratios) / len(valid_ratios) if valid_ratios else 3.0
        else:
            peer_avg_pb = 3.0  # fallback
    
    try:
        peer_avg_pb = float(peer_avg_pb)
        bvps = float(bvps)
        target_price = peer_avg_pb * bvps
    except (TypeError, ValueError):
        return {
            "error": "Invalid numeric values",
            "peer_avg_pb": None,
            "bvps": None,
            "target_price": None,
            "current_price": None,
            "recommendation": None
        }

    try:
        raw = load_company_df()
        latest_row = raw.sort_values('period_end').iloc[-1]
        current_price = float(latest_row.get('market_price', 0))
        current_price = current_price if current_price > 0 else None
    except:
        current_price = None

    recommendation = None
    if current_price is not None and current_price > 0:
        upside = (target_price - current_price)/current_price
        if upside > 0.15: recommendation = "BUY"
        elif upside < -0.10: recommendation = "SELL"
        else: recommendation = "HOLD"
    
    return {
        "peer_avg_pb": round(peer_avg_pb, 2),
        "bvps": round(bvps, 2),
        "target_price": round(target_price, 2),
        "current_price": round(current_price, 2) if current_price is not None else None,
        "recommendation": recommendation,
        "error": None
    }

def compute_ddm_value(g: float, ke: float):
    try:
        raw = load_company_df()
        latest = raw.sort_values('period_end').iloc[-1]
        dps = float(latest.get("dps", 0))
        
        if dps <= 0:
            return {
                "error": "No valid DPS found",
                "dps": None,
                "g": None,
                "ke": None,
                "intrinsic_value": None
            }
            
        g = float(g)
        ke = float(ke)
        
        if ke <= g:
            return {
                "error": "Cost of equity must be greater than growth rate",
                "dps": dps,
                "g": g,
                "ke": ke,
                "intrinsic_value": None
            }
            
        intrinsic = (dps * (1 + g)) / (ke - g)
        
        return {
            "error": None,
            "dps": round(dps, 2),
            "g": round(g, 4),
            "ke": round(ke, 4),
            "intrinsic_value": round(intrinsic, 2)
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "dps": None,
            "g": None,
            "ke": None,
            "intrinsic_value": None
        }
