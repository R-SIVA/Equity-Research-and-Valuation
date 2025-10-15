
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.services.ingest import (
    process_upload_single,
    process_upload_peers,
    get_saved_entity,
    load_peers,
    load_peer_trends,
    rank_peers
)
from app.services.ratios import compute_ratios_single
from app.services.models import train_all_models_for_entity, forecast_metric
from app.services.valuation import compute_pb_target, compute_ddm_value
import traceback

router = APIRouter()

@router.post("/upload/company")
async def upload_company(file: UploadFile = File(...)):
    try:
        result = await process_upload_single(file)
        try:
            train_all_models_for_entity(result['entity'])
        except Exception:
            traceback.print_exc()
        return {"status": "ok", "result": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upload/peers")
async def upload_peers(file: UploadFile = File(...)):
    try:
        result = await process_upload_peers(file)
        return {"status":"ok", "result": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/ratios")
def get_ratios():
    df = compute_ratios_single()
    return {"entity": df['entity'].iloc[0], "ratios": df.drop(columns=['entity']).to_dict(orient="records")}

@router.post("/train")
def train_models(entity: Optional[str] = Form(None)):
    ent = entity or get_saved_entity()
    model_ids = train_all_models_for_entity(ent)
    return {"status":"ok", "models": model_ids}

@router.get("/forecast")
def forecast(metric: str, horizon_q: int = 8):
    fc = forecast_metric(metric, horizon_q)
    return {"metric": metric, "forecast": fc.to_dict(orient="records")}

@router.post("/valuation/pb")
def pb_valuation(peer_avg_pb: Optional[float] = Form(None)):
    return compute_pb_target(peer_avg_pb)

@router.post("/valuation/ddm")
def ddm_valuation(g: float = Form(...), ke: float = Form(...)):
    return compute_ddm_value(g, ke)

@router.get("/peers")
def get_peers():
    return load_peers()

@router.get("/peers/trend")
def get_peer_trend(metric: str):
    return load_peer_trends(metric)

@router.get("/peers/rank")
def get_peer_rank(metric: str, higher_is_better: bool = True):
    return rank_peers(metric, higher_is_better)





# # from fastapi import APIRouter, UploadFile, File, Form, HTTPException
# # from typing import Optional
# # from app.services.ingest import process_upload_single
# # from app.services.ratios import compute_ratios_single
# # from app.services.models import train_all_models_for_entity, forecast_metric
# # from app.services.valuation import compute_pb_target, compute_ddm_value
# # import traceback

# # router = APIRouter()

# # # Upload single company data (overwrites previous)
# # @router.post("/upload")
# # async def upload_file(file: UploadFile = File(...)):
# #     try:
# #         result = await process_upload_single(file)
# #         # optionally train models automatically
# #         try:
# #             train_all_models_for_entity(result['entity'])
# #         except Exception:
# #             # training optional on upload; swallow but log
# #             traceback.print_exc()
# #         return {"status": "ok", "result": result}
# #     except Exception as e:
# #         raise HTTPException(status_code=400, detail=str(e))

# # # Get computed ratios
# # @router.get("/ratios")
# # def get_ratios():
# #     try:
# #         df = compute_ratios_single()
# #         return {"entity": df['entity'].iloc[0], "ratios": df.drop(columns=['entity']).to_dict(orient="records")}
# #     except Exception as e:
# #         raise HTTPException(status_code=400, detail=str(e))

# # # Train models (all metrics)
# # @router.post("/train")
# # def train_models(entity: Optional[str] = Form(None)):
# #     try:
# #         from app.services.ingest import get_saved_entity
# #         ent = entity or get_saved_entity()
# #         model_ids = train_all_models_for_entity(ent)
# #         return {"status":"ok", "models": model_ids}
# #     except Exception as e:
# #         raise HTTPException(status_code=400, detail=str(e))

# # # Forecast a metric: metric in {"nim","gnpa","casa"}
# # @router.get("/forecast")
# # def forecast(metric: str, horizon_q: int = 8):
# #     try:
# #         fc = forecast_metric(metric, horizon_q)
# #         return {"metric": metric, "forecast": fc.to_dict(orient="records")}
# #     except Exception as e:
# #         raise HTTPException(status_code=400, detail=str(e))

# # # Valuation P/B: supply peer_avg_pb optionally via form
# # @router.post("/valuation/pb")
# # def pb_valuation(peer_avg_pb: Optional[float] = Form(None)):
# #     try:
# #         res = compute_pb_target(peer_avg_pb)
# #         return res
# #     except Exception as e:
# #         raise HTTPException(status_code=400, detail=str(e))

# # # DDM
# # @router.post("/valuation/ddm")
# # def ddm_valuation(g: float = Form(...), ke: float = Form(...)):
# #     try:
# #         v = compute_ddm_value(g, ke)
# #         return {"ddm_value": v}
# #     except Exception as e:
# #         raise HTTPException(status_code=400, detail=str(e))

