from app.services.ratios import compute_ratios_single
from prophet import Prophet
from pathlib import Path
import joblib
import pandas as pd

MODELS_DIR = Path(__file__).resolve().parents[2] / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

METRIC_MAP = {
    "nim": "nim_percent",
    "gnpa": "gnpa_percent",
    "casa": "casa_percent"
}

def train_model_for_metric(entity, metric):
    col = METRIC_MAP.get(metric)
    if not col:
        raise ValueError("Unsupported metric")
    df = compute_ratios_single()
    series = df[['period_end', col]].rename(columns={'period_end':'ds', col:'y'}).dropna()
    if series.empty or len(series) < 4:
        raise ValueError(f"Not enough data to train {metric} model (need >=4 points)")
    m = Prophet()
    m.fit(series)
    model_id = f"{entity}_{metric}"
    joblib.dump(m, MODELS_DIR / f"{model_id}.pkl")
    return model_id

def train_all_models_for_entity(entity=None):
    if entity is None:
        entity = compute_ratios_single()['entity'].iloc[0]
    trained = []
    for metric in METRIC_MAP.keys():
        try:
            model_id = train_model_for_metric(entity, metric)
            trained.append(model_id)
        except Exception as e:
            # continue for other metrics
            print(f"Could not train {metric}: {e}")
    return trained

def forecast_metric(metric, horizon_q=8):
    from pathlib import Path
    entity = compute_ratios_single()['entity'].iloc[0]
    model_path = MODELS_DIR / f"{entity}_{metric}.pkl"
    if not model_path.exists():
        # attempt to train then forecast
        train_model_for_metric(entity, metric)
    m = joblib.load(model_path)
    future = m.make_future_dataframe(periods=horizon_q, freq='Q')
    fc = m.predict(future)
    # return subset
    out = fc[['ds','yhat','yhat_lower','yhat_upper']].rename(columns={'ds':'period_end'})
    # convert period_end to string
    out['period_end'] = out['period_end'].dt.strftime('%Y-%m-%d')
    return out
