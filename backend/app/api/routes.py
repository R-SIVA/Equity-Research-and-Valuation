from fastapi import APIRouter, UploadFile, File,Form, HTTPException
from typing import Optional
from pydantic import BaseModel
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
import logging

# Initialize logger
logger = logging.getLogger("api_routes")
logger.setLevel(logging.INFO)

router = APIRouter()

@router.post("/upload/company")
async def upload_company(file: UploadFile = File(...)):
    try:
        result = await process_upload_single(file)
        try:
            train_all_models_for_entity(result['entity'])
        except Exception as e:
            logger.error(f"Model training failed: {e}")
            traceback.print_exc()
        return {"status": "ok", "result": result}
    except Exception as e:
        logger.error(f"Upload company failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upload/peers")
async def upload_peers(file: UploadFile = File(...)):
    try:
        result = await process_upload_peers(file)
        return {"status":"ok", "result": result}
    except Exception as e:
        logger.error(f"Upload peers failed: {e}")
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

# Pydantic models for request validation
class PBValuationRequest(BaseModel):
    peer_avg_pb: Optional[float] = None

class DDMValuationRequest(BaseModel):
    g: float
    ke: float

@router.post("/valuation/pb")
def pb_valuation(request: PBValuationRequest):
    return compute_pb_target(request.peer_avg_pb)

@router.post("/valuation/ddm")
def ddm_valuation(request: DDMValuationRequest):
    return compute_ddm_value(request.g, request.ke)

@router.get("/peers")
def get_peers():
    return load_peers()

@router.get("/peers/trend")
def get_peer_trend(metric: str):
    return load_peer_trends(metric)

@router.get("/peers/rank")
def get_peer_rank(metric: str, higher_is_better: bool = True):
    return rank_peers(metric, higher_is_better)

