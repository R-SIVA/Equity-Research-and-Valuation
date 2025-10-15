# # # from app.services.ratios import compute_ratios_single
# # # from app.services.ingest import load_company_df
# # # import pandas as pd

# # # # compute target P/B price using peer_avg_pb input if provided else default
# # # def compute_pb_target(peer_avg_pb=None):
# # #     df = compute_ratios_single()
# # #     latest = df.sort_values('period_end').iloc[-1]
# # #     bvps = latest['bvps']
# # #     if peer_avg_pb is None:
# # #         # fallback default peer P/B (example): 3.0
# # #         peer_avg_pb = 3.0
# # #     target_price = peer_avg_pb * bvps
# # #     # current price: try to read from optional column in company file (market_price) else None
# # #     try:
# # #         raw = load_company_df()
# # #         if 'market_price' in raw.columns:
# # #             current_price = raw.sort_values('period_end').iloc[-1]['market_price']
# # #         else:
# # #             current_price = None
# # #     except:
# # #         current_price = None
# # #     # compute recommendation
# # #     recommendation = None
# # #     if current_price is not None:
# # #         upside = (target_price - current_price)/current_price
# # #         if upside > 0.15:
# # #             recommendation = "BUY"
# # #         elif upside < -0.10:
# # #             recommendation = "SELL"
# # #         else:
# # #             recommendation = "HOLD"
# # #     # check overrides: GNPA recent trend and CAR
# # #     # quick check: if gnpa increased in last 4 periods > +1.5 ppt total => SELL
# # #     gnpa_series = df.sort_values('period_end')['gnpa_percent'].dropna()
# # #     override = None
# # #     if len(gnpa_series) >= 4:
# # #         if gnpa_series.iloc[-1] - gnpa_series.iloc[-4] > 1.5:
# # #             override = "SELL"
# # #     if latest['capital_adequacy_ratio'] is not None and latest['capital_adequacy_ratio'] < 12.5:
# # #         override = "SELL"
# # #     if override:
# # #         recommendation = override
# # #     return {"peer_avg_pb": peer_avg_pb, "bvps": bvps, "target_price": target_price, "current_price": current_price, "recommendation": recommendation}

# # # # DDM (Gordon) using latest DPS
# # # def compute_ddm_value(g, ke):
# # #     df = compute_ratios_single()
# # #     latest = df.sort_values('period_end').iloc[-1]
# # #     last_dps = latest['dps']
# # #     if pd.isna(last_dps) or last_dps == 0:
# # #         raise ValueError("DPS missing or zero; DDM not applicable")
# # #     if ke <= g:
# # #         raise ValueError("Cost of equity must be greater than growth rate")
# # #     terminal = last_dps * (1 + g) / (ke - g)
# # #     return {"last_dps": last_dps, "g": g, "ke": ke, "ddm_value": terminal}


# # from app.services.ratios import compute_ratios_single
# # from app.services.ingest import load_company_df, load_peers
# # import pandas as pd

# # def compute_pb_target(peer_avg_pb=None):
# #     df = compute_ratios_single()
# #     latest = df.sort_values('period_end').iloc[-1]
# #     bvps = latest['bvps']
# #     if peer_avg_pb is None:
# #         peers = load_peers()
# #         if peers:
# #             peer_avg_pb = sum([p['pb_ratio'] for p in peers if pd.notna(p['pb_ratio'])]) / len(peers)
# #         else:
# #             peer_avg_pb = 3.0  # default fallback
# #     target_price = peer_avg_pb * bvps
# #     try:
# #         raw = load_company_df()
# #         current_price = raw.sort_values('period_end').iloc[-1].get('market_price', None)
# #     except:
# #         current_price = None
# #     recommendation = None
# #     if current_price is not None:
# #         upside = (target_price - current_price)/current_price
# #         if upside > 0.15: recommendation = "BUY"
# #         elif upside < -0.10: recommendation = "SELL"
# #         else: recommendation = "HOLD"
# #     return {"peer_avg_pb": peer_avg_pb, "bvps": bvps, "target_price": target_price, "current_price": current_price, "recommendation": recommendation}


# from app.services.ratios import compute_ratios_single
# from app.services.ingest import load_company_df, load_peers
# import pandas as pd

# # ---- P/B valuation ----
# def compute_pb_target(peer_avg_pb=None):
#     df = compute_ratios_single()
#     latest = df.sort_values('period_end').iloc[-1]
#     bvps = latest['bvps']

#     if peer_avg_pb is None:
#         peers = load_peers()
#         if peers:
#             peer_avg_pb = sum([p['pb_ratio'] for p in peers if pd.notna(p['pb_ratio'])]) / len(peers)
#         else:
#             peer_avg_pb = 3.0  # fallback if no peer data

#     target_price = peer_avg_pb * bvps

#     try:
#         raw = load_company_df()
#         current_price = raw.sort_values('period_end').iloc[-1].get('market_price', None)
#     except:
#         current_price = None

#     recommendation = None
#     if current_price is not None:
#         upside = (target_price - current_price)/current_price
#         if upside > 0.15: recommendation = "BUY"
#         elif upside < -0.10: recommendation = "SELL"
#         else: recommendation = "HOLD"

#     return {
#         "peer_avg_pb": peer_avg_pb,
#         "bvps": bvps,
#         "target_price": target_price,
#         "current_price": current_price,
#         "recommendation": recommendation
#     }

# # ---- Dividend Discount Model ----
# def compute_ddm_value(g: float, ke: float):
#     raw = load_company_df()
#     latest = raw.sort_values('period_end').iloc[-1]
#     dps = latest.get("dps", None)
#     if dps is None:
#         return {"error": "No DPS found"}
#     intrinsic = (dps * (1+g)) / (ke - g)
#     return {"dps": dps, "g": g, "ke": ke, "intrinsic_value": intrinsic}


from app.services.ratios import compute_ratios_single
from app.services.ingest import load_company_df, load_peers
import pandas as pd

# ---- P/B valuation ----
def compute_pb_target(peer_avg_pb=None):
    df = compute_ratios_single()
    latest = df.sort_values('period_end').iloc[-1]
    bvps = latest['bvps']

    if peer_avg_pb is None:
        peers = load_peers()
        if peers:
            peer_avg_pb = sum([p['pb_ratio'] for p in peers if pd.notna(p['pb_ratio'])]) / len(peers)
        else:
            peer_avg_pb = 3.0  # fallback

    target_price = peer_avg_pb * bvps

    try:
        raw = load_company_df()
        current_price = raw.sort_values('period_end').iloc[-1].get('market_price', None)
    except:
        current_price = None

    recommendation = None
    if current_price is not None:
        upside = (target_price - current_price)/current_price
        if upside > 0.15: recommendation = "BUY"
        elif upside < -0.10: recommendation = "SELL"
        else: recommendation = "HOLD"

    return {
        "peer_avg_pb": peer_avg_pb,
        "bvps": bvps,
        "target_price": target_price,
        "current_price": current_price,
        "recommendation": recommendation
    }

# ---- Dividend Discount Model ----
def compute_ddm_value(g: float, ke: float):
    raw = load_company_df()
    latest = raw.sort_values('period_end').iloc[-1]
    dps = latest.get("dps", None)
    if dps is None:
        return {"error": "No DPS found"}
    intrinsic = (dps * (1+g)) / (ke - g)
    return {"dps": dps, "g": g, "ke": ke, "intrinsic_value": intrinsic}
