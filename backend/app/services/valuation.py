# from app.services.ratios import compute_ratios_single
# from app.services.ingest import load_company_df, load_peers
# import pandas as pd

# # ---- P/B valuation ----
# def compute_pb_target(peer_avg_pb=None):
#     ratios = compute_ratios_single()
#     if ratios is None or ratios.empty:
#         return {
#             "error": "No data available",
#             "peer_avg_pb": None,
#             "bvps": None,
#             "target_price": None,
#             "current_price": None,
#             "recommendation": None
#         }
    
#     latest = ratios.sort_values('period_end').iloc[-1]
#     bvps = latest.get('bvps')
    
#     if bvps is None:
#         return {
#             "error": "BVPS not available",
#             "peer_avg_pb": None,
#             "bvps": None,
#             "target_price": None,
#             "current_price": None,
#             "recommendation": None
#         }

#     if peer_avg_pb is None:
#         peers = load_peers()
#         if peers:
#             valid_ratios = [p['pb_ratio'] for p in peers if pd.notna(p.get('pb_ratio'))]
#             peer_avg_pb = sum(valid_ratios) / len(valid_ratios) if valid_ratios else 3.0
#         else:
#             peer_avg_pb = 3.0  # fallback
    
#     try:
#         peer_avg_pb = float(peer_avg_pb)
#         bvps = float(bvps)
#         target_price = peer_avg_pb * bvps
#     except (TypeError, ValueError):
#         return {
#             "error": "Invalid numeric values",
#             "peer_avg_pb": None,
#             "bvps": None,
#             "target_price": None,
#             "current_price": None,
#             "recommendation": None
#         }

#     try:
#         raw = load_company_df()
#         latest_row = raw.sort_values('period_end').iloc[-1]
#         current_price = float(latest_row.get('market_price', 0))
#         current_price = current_price if current_price > 0 else None
#     except:
#         current_price = None

#     recommendation = None
#     if current_price is not None and current_price > 0:
#         upside = (target_price - current_price)/current_price
#         if upside > 0.15: recommendation = "BUY"
#         elif upside < -0.10: recommendation = "SELL"
#         else: recommendation = "HOLD"
    
#     return {
#         "peer_avg_pb": round(peer_avg_pb, 2),
#         "bvps": round(bvps, 2),
#         "target_price": round(target_price, 2),
#         "current_price": round(current_price, 2) if current_price is not None else None,
#         "recommendation": recommendation,
#         "error": None
#     }

# def compute_ddm_value(g: float, ke: float):
#     try:
#         raw = load_company_df()
#         latest = raw.sort_values('period_end').iloc[-1]
#         dps = float(latest.get("dps", 0))
        
#         if dps <= 0:
#             return {
#                 "error": "No valid DPS found",
#                 "dps": None,
#                 "g": None,
#                 "ke": None,
#                 "intrinsic_value": None
#             }
            
#         g = float(g)
#         ke = float(ke)
        
#         if ke <= g:
#             return {
#                 "error": "Cost of equity must be greater than growth rate",
#                 "dps": dps,
#                 "g": g,
#                 "ke": ke,
#                 "intrinsic_value": None
#             }
            
#         intrinsic = (dps * (1 + g)) / (ke - g)
        
#         return {
#             "error": None,
#             "dps": round(dps, 2),
#             "g": round(g, 4),
#             "ke": round(ke, 4),
#             "intrinsic_value": round(intrinsic, 2)
#         }
        
#     except Exception as e:
#         return {
#             "error": str(e),
#             "dps": None,
#             "g": None,
#             "ke": None,
#             "intrinsic_value": None
#         }


from app.services.ratios import compute_ratios_single
from app.services.ingest import load_company_df, load_peers
from app.services.models import forecast_metric
import pandas as pd
import math

# ---- P/B valuation ----
def compute_pb_target(peer_avg_pb=None):
    """
    Returns:
      {
        "peer_avg_pb": float,
        "bvps": float,
        "target_price": float,
        "current_price": float or None,
        "allocation": {"buy": int, "hold": int, "sell": int},  # sum to 100
        "scores": {"pb_upside": float, "nim_trend": float, "gnpa_trend": float},
        "reason": {
           "summary": "...",
           "details": {
              "pb": "...",
              "nim": "...",
              "gnpa": "..."
           }
        },
        "recommendation": original_recommendation_if_any_or_None,
        "error": None
      }
    """
    ratios = compute_ratios_single()
    if ratios is None or ratios.empty:
        return {
            "error": "No data available",
            "peer_avg_pb": None,
            "bvps": None,
            "target_price": None,
            "current_price": None,
            "allocation": {"buy": 0, "hold": 0, "sell": 0},
            "scores": {},
            "reason": None,
            "recommendation": None
        }

    latest = ratios.sort_values('period_end').iloc[-1]
    bvps = latest.get('bvps')

    if bvps is None:
        return {
            "error": "BVPS not available",
            "peer_avg_pb": None,
            "bvps": None,
            "target_price": None,
            "current_price": None,
            "allocation": {"buy": 0, "hold": 0, "sell": 0},
            "scores": {},
            "reason": None,
            "recommendation": None
        }

    # --- determine peer_avg_pb if not supplied ---
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
            "allocation": {"buy": 0, "hold": 0, "sell": 0},
            "scores": {},
            "reason": None,
            "recommendation": None
        }

    # --- attempt to read current market price if present ---
    try:
        raw = load_company_df()
        latest_row = raw.sort_values('period_end').iloc[-1]
        current_price = float(latest_row.get('market_price', 0))
        current_price = current_price if current_price > 0 else None
    except Exception:
        current_price = None

    # --- legacy categorical recommendation preserved (for backward compatibility) ---
    recommendation = None
    if current_price is not None and current_price > 0:
        upside = (target_price - current_price) / current_price
        if upside > 0.15:
            recommendation = "BUY"
        elif upside < -0.10:
            recommendation = "SELL"
        else:
            recommendation = "HOLD"

    # --------------------------------------------------------------------------------
    # Compute auxiliary signals (pb_upside score, nim trend, gnpa trend) to build allocation
    # --------------------------------------------------------------------------------
    # 1) pb_upside: normalized between -1 and +1
    if current_price is not None and current_price > 0:
        pb_upside = (target_price - current_price) / current_price  # e.g. 0.2 => +0.2
    else:
        # if no current price, compare to peer implied valuation relative to BVPS (neutral if unknown)
        pb_upside = 0.0

    # normalize pb_upside roughly to -1..1 using tanh for stability
    pb_score = math.tanh(pb_upside * 3.0)  # multiplier makes +/-0.15 meaningful

    # 2) nim_trend: use forecasting to get direction (positive => improving)
    nim_score = 0.0
    gnpa_score = 0.0
    try:
        # fetch forecasts (4 quarters) and infer trend compared to last historical
        nim_fc = forecast_metric('nim', horizon_q=4)  # Returns DataFrame-like
        gnpa_fc = forecast_metric('gnpa', horizon_q=4)

        # ensure we have series
        # nim: compute mean of forecast yhat and compare with latest historical nim
        if hasattr(nim_fc, "to_dict"):
            # python caller mode (pandas DF) -> convert
            nim_df = nim_fc
        else:
            nim_df = nim_fc

        # compute last historical nim
        hist_df = compute_ratios_single()
        hist_df = hist_df.sort_values('period_end')
        last_nim = float(hist_df['nim_percent'].dropna().iloc[-1]) if hist_df['nim_percent'].dropna().size > 0 else None
        last_gnpa = float(hist_df['gnpa_percent'].dropna().iloc[-1]) if hist_df['gnpa_percent'].dropna().size > 0 else None

        # nim forecast mean (average of forecast points) if available
        try:
            nim_mean_fc = float(nim_fc['yhat'].tail(4).mean())
        except Exception:
            nim_mean_fc = None

        try:
            gnpa_mean_fc = float(gnpa_fc['yhat'].tail(4).mean())
        except Exception:
            gnpa_mean_fc = None

        if last_nim is not None and nim_mean_fc is not None:
            # positive if forecast > last -> improving margins
            nim_delta = (nim_mean_fc - last_nim) / max(abs(last_nim), 1e-6)
            nim_score = math.tanh(nim_delta * 5.0)  # amplify small changes
        else:
            nim_score = 0.0

        if last_gnpa is not None and gnpa_mean_fc is not None:
            # if forecast GNPA rises -> negative signal (worse asset quality)
            gnpa_delta = (gnpa_mean_fc - last_gnpa) / max(abs(last_gnpa), 1e-6)
            gnpa_score = -math.tanh(gnpa_delta * 5.0)  # invert so that rising GNPA reduces score
        else:
            gnpa_score = 0.0

    except Exception:
        # forecasting may fail; safe neutral scores
        nim_score = 0.0
        gnpa_score = 0.0

    # Combined normalized score in [-1, 1]
    # Give weights: pb 40%, nim 35%, gnpa 25% (you can tune)
    combined_score = (0.40 * pb_score) + (0.35 * nim_score) + (0.25 * gnpa_score)
    # clamp to [-1, 1]
    combined_score = max(-1.0, min(1.0, combined_score))

    # Map combined_score to allocation percentages (buy/hold/sell sum to 100)
    # Base distribution: buy 40, hold 30, sell 30
    buy_base = 40.0
    hold_base = 30.0
    sell_base = 30.0

    # Adjustments: push buy up when combined_score>0, push sell up when <0
    buy_adj = combined_score * 30.0     # range -30..+30
    sell_adj = -combined_score * 20.0   # inverse small effect
    # Compute raw
    buy_raw = buy_base + buy_adj
    sell_raw = sell_base + sell_adj
    # Ensure within bounds
    buy_raw = max(0.0, min(100.0, buy_raw))
    sell_raw = max(0.0, min(100.0, sell_raw))
    hold_raw = 100.0 - (buy_raw + sell_raw)
    # If hold becomes negative due to extreme adjustments, re-normalize
    if hold_raw < 0:
        # scale down buy and sell proportionally
        total = buy_raw + sell_raw
        if total <= 0:
            buy_raw, sell_raw = 50.0, 50.0
        else:
            scale = 100.0 / total
            buy_raw *= scale
            sell_raw *= scale
        hold_raw = 0.0

    # Round to integers and ensure sum == 100
    buy_pct = int(round(buy_raw))
    sell_pct = int(round(sell_raw))
    hold_pct = int(round(100 - buy_pct - sell_pct))

    # Fix rounding edge cases
    if buy_pct + hold_pct + sell_pct != 100:
        diff = 100 - (buy_pct + hold_pct + sell_pct)
        # apply diff to hold
        hold_pct += diff

    # Build structured reason
    reason_details = {
        "pb": f"Peer avg P/B used: {round(peer_avg_pb,2)} -> implied target ₹{round(target_price,2)} vs current ₹{round(current_price,2) if current_price else 'N/A'}. PB upside raw: {round(pb_upside,4)}.",
        "nim": f"Latest NIM: {round(last_nim,4) if 'last_nim' in locals() and last_nim is not None else 'N/A'}. Forecast mean (next quarters): {round(nim_mean_fc,4) if 'nim_mean_fc' in locals() and nim_mean_fc is not None else 'N/A'}. NIM signal: {round(nim_score,3)}.",
        "gnpa": f"Latest GNPA%: {round(last_gnpa,4) if 'last_gnpa' in locals() and last_gnpa is not None else 'N/A'}. Forecast mean (next quarters): {round(gnpa_mean_fc,4) if 'gnpa_mean_fc' in locals() and gnpa_mean_fc is not None else 'N/A'}. GNPA signal: {round(-gnpa_score if gnpa_score is not None else 0.0,3)} (positive -> worse)."
    }
    summary = []
    # pb-based comment
    if pb_upside is not None:
        if pb_upside > 0.12:
            summary.append("Strong valuation upside vs current price (P/B based).")
        elif pb_upside < -0.10:
            summary.append("Valuation indicates downside vs current price (P/B based).")
        else:
            summary.append("Valuation roughly in line with current price (P/B).")
    # nim comment
    if nim_score is not None:
        if nim_score > 0.2:
            summary.append("Forecasted improvement in NIM supports allocation towards BUY.")
        elif nim_score < -0.2:
            summary.append("Forecasted deterioration in NIM supports caution (HOLD/SELL).")
    # gnpa comment
    if gnpa_score is not None:
        # recall gnpa_score inverted earlier (negative if gnpa rising)
        if gnpa_score > 0.15:
            summary.append("GNPA forecast improving — positive for asset quality.")
        elif gnpa_score < -0.15:
            summary.append("GNPA forecast worsening — increases downside risk.")

    overall_summary = " ".join(summary) if summary else "Signals are neutral."

    # Build return object
    out = {
        "peer_avg_pb": round(peer_avg_pb, 2),
        "bvps": round(bvps, 2),
        "target_price": round(target_price, 2),
        "current_price": round(current_price, 2) if current_price is not None else None,
        "allocation": {"buy": buy_pct, "hold": hold_pct, "sell": sell_pct},
        "scores": {
            "pb_upside": round(pb_score, 4),
            "nim_trend": round(nim_score, 4),
            "gnpa_trend": round(gnpa_score, 4),
            "combined": round(combined_score, 4)
        },
        "reason": {
            "summary": overall_summary,
            "details": reason_details
        },
        "recommendation": recommendation,  # preserved for compatibility (string)
        "error": None
    }

    return out



def compute_ddm_value(g=0.02, ke=0.10):
    """
    Simple Dividend Discount Model (DDM)
    P = D1 / (ke - g)
    where:
      D1 = next year's dividend = last dividend * (1 + g)
      ke = cost of equity
      g = growth rate of dividends
    """
    from app.services.ratios import compute_ratios_single

    try:
        ratios = compute_ratios_single()
        if ratios is None or ratios.empty:
            return {"error": "No data available"}

        # get last dividend per share
        latest = ratios.sort_values('period_end').iloc[-1]
        dps = latest.get('dividend_per_share', None)

        if dps is None or dps == 0:
            return {"error": "Dividend per share not available"}

        D1 = dps * (1 + g)
        if ke <= g:
            return {"error": "ke must be greater than g"}

        intrinsic_value = D1 / (ke - g)

        return {
            "intrinsic_value": round(intrinsic_value, 2),
            "dps": round(dps, 2),
            "growth_rate": g,
            "cost_of_equity": ke,
            "error": None
        }

    except Exception as e:
        return {"error": str(e)}
