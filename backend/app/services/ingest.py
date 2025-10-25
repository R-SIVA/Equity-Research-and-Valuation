# # # import pandas as pd, io
# # # from pathlib import Path
# # # from fastapi import UploadFile

# # # DATA_DIR = Path(__file__).resolve().parents[2] / "data"
# # # SINGLE_FILE = DATA_DIR / "company_financials.csv"
# # # DATA_DIR.mkdir(parents=True, exist_ok=True)

# # # REQUIRED_COLUMNS = [
# # #     "entity","period_end","period_type","total_assets","total_deposits","current_account","savings_account",
# # #     "gross_advances","net_advances","interest_income","interest_expense","non_interest_income","operating_expenses",
# # #     "provisions","gross_npa_amount","net_npa_amount","shareholders_equity","number_of_shares","net_profit","eps",
# # #     "dps","capital_adequacy_ratio"
# # # ]

# # # async def process_upload_single(file: UploadFile):
# # #     content = await file.read()
# # #     ext = Path(file.filename).suffix.lower()
# # #     if ext in [".xls",".xlsx"]:
# # #         df = pd.read_excel(io.BytesIO(content))
# # #     elif ext == ".csv":
# # #         df = pd.read_csv(io.BytesIO(content))
# # #     else:
# # #         raise ValueError("Unsupported file type. Use .xlsx or .csv")
# # #     # normalize column names
# # #     df.columns = [c.strip() for c in df.columns]
# # #     missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
# # #     if missing:
# # #         raise ValueError(f"Missing required columns: {missing}")
# # #     df['period_end'] = pd.to_datetime(df['period_end'])
# # #     df = df.sort_values('period_end')
# # #     # save to single file (csv)
# # #     df.to_csv(SINGLE_FILE, index=False)
# # #     # return summary
# # #     return {"entity": df['entity'].iloc[0], "rows": len(df), "saved_to": str(SINGLE_FILE)}

# # # def get_saved_entity():
# # #     if not SINGLE_FILE.exists():
# # #         raise FileNotFoundError("No company data uploaded yet.")
# # #     df = pd.read_csv(SINGLE_FILE)
# # #     return df['entity'].iloc[0]

# # # def load_company_df():
# # #     if not SINGLE_FILE.exists():
# # #         raise FileNotFoundError("No company data uploaded yet.")
# # #     df = pd.read_csv(SINGLE_FILE, parse_dates=['period_end'])
# # #     return df



# # import pandas as pd, io
# # from pathlib import Path
# # from fastapi import UploadFile

# # DATA_DIR = Path(__file__).resolve().parents[2] / "data"
# # SINGLE_FILE = DATA_DIR / "company_financials.csv"
# # PEER_FILE = DATA_DIR / "peer_comparison.csv"
# # DATA_DIR.mkdir(parents=True, exist_ok=True)

# # REQUIRED_COLUMNS_COMPANY = [
# #     "entity","period_end","period_type","total_assets","total_deposits","current_account","savings_account",
# #     "gross_advances","net_advances","interest_income","interest_expense","non_interest_income","operating_expenses",
# #     "provisions","gross_npa_amount","net_npa_amount","shareholders_equity","number_of_shares","net_profit","eps","dps","capital_adequacy_ratio"
# # ]

# # REQUIRED_COLUMNS_PEER = ["entity","pb_ratio","roe","gnpa_percent","car","market_cap"]

# # async def process_upload_single(file: UploadFile):
# #     content = await file.read()
# #     ext = Path(file.filename).suffix.lower()
# #     if ext in [".xls",".xlsx"]:
# #         df = pd.read_excel(io.BytesIO(content))
# #     elif ext == ".csv":
# #         df = pd.read_csv(io.BytesIO(content))
# #     else:
# #         raise ValueError("Unsupported file type")
# #     df.columns = [c.strip() for c in df.columns]
# #     missing = [c for c in REQUIRED_COLUMNS_COMPANY if c not in df.columns]
# #     if missing:
# #         raise ValueError(f"Missing company columns: {missing}")
# #     df['period_end'] = pd.to_datetime(df['period_end'])
# #     df = df.sort_values('period_end')
# #     df.to_csv(SINGLE_FILE, index=False)
# #     return {"entity": df['entity'].iloc[0], "rows": len(df)}

# # async def process_upload_peers(file: UploadFile):
# #     content = await file.read()
# #     ext = Path(file.filename).suffix.lower()
# #     if ext in [".xls",".xlsx"]:
# #         df = pd.read_excel(io.BytesIO(content))
# #     elif ext == ".csv":
# #         df = pd.read_csv(io.BytesIO(content))
# #     else:
# #         raise ValueError("Unsupported file type")
# #     df.columns = [c.strip() for c in df.columns]
# #     missing = [c for c in REQUIRED_COLUMNS_PEER if c not in df.columns]
# #     if missing:
# #         raise ValueError(f"Missing peer columns: {missing}")
# #     df.to_csv(PEER_FILE, index=False)
# #     return {"rows": len(df)}

# # def load_peers():
# #     if not PEER_FILE.exists():
# #         return []
# #     df = pd.read_csv(PEER_FILE)
# #     return df.to_dict(orient="records")

# # def get_saved_entity():
# #     if not SINGLE_FILE.exists():
# #         raise FileNotFoundError("No company data uploaded")
# #     df = pd.read_csv(SINGLE_FILE)
# #     return df['entity'].iloc[0]

# # def load_company_df():
# #     if not SINGLE_FILE.exists():
# #         raise FileNotFoundError("No company data uploaded")
# #     df = pd.read_csv(SINGLE_FILE, parse_dates=['period_end'])
# #     return df


import pandas as pd, io
from pathlib import Path
from fastapi import UploadFile, HTTPException

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
SINGLE_FILE = DATA_DIR / "company_financials.csv"
PEER_FILE = DATA_DIR / "peer_comparison.csv"
DATA_DIR.mkdir(parents=True, exist_ok=True)
# Required columns
REQUIRED_COLUMNS_COMPANY = [
    "entity","period_end","period_type","total_assets","total_deposits","current_account","savings_account",
    "gross_advances","net_advances","interest_income","interest_expense","non_interest_income","operating_expenses",
    "provisions","gross_npa_amount","net_npa_amount","shareholders_equity","number_of_shares","net_profit","eps","dps","capital_adequacy_ratio"
]

REQUIRED_COLUMNS_PEER = ["entity","pb_ratio","roe","gnpa_percent","car","market_cap"]

# ---- COMPANY ----
async def process_upload_single(file: UploadFile):
    content = await file.read()
    ext = Path(file.filename).suffix.lower()
    if ext not in [".xls", ".xlsx", ".csv"]:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use .xlsx, .xls, or .csv")
    try:
        if ext in [".xls", ".xlsx"]:
            df = pd.read_excel(io.BytesIO(content))
        elif ext == ".csv":
            df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {e}")
    df.columns = [c.strip() for c in df.columns]
    missing = [c for c in REQUIRED_COLUMNS_COMPANY if c not in df.columns]
    if missing:
        raise ValueError(f"Missing company columns: {missing}")
    df['period_end'] = pd.to_datetime(df['period_end'])
    df = df.sort_values('period_end')
    df.to_csv(SINGLE_FILE, index=False)
    return {"entity": df['entity'].iloc[0], "rows": len(df)}

# ---- PEERS ----
async def process_upload_peers(file: UploadFile):
    content = await file.read()
    ext = Path(file.filename).suffix.lower()
    if ext in [".xls",".xlsx"]:
        df = pd.read_excel(io.BytesIO(content))
    elif ext == ".csv":
        df = pd.read_csv(io.BytesIO(content))
    else:
        raise ValueError("Unsupported file type")
    df.columns = [c.strip() for c in df.columns]
    missing = [c for c in REQUIRED_COLUMNS_PEER if c not in df.columns]
    if missing:
        raise ValueError(f"Missing peer columns: {missing}")
    df.to_csv(PEER_FILE, index=False)
    return {"rows": len(df)}


# ---- LOADERS ----
def load_peers():
    if not PEER_FILE.exists():
        return []
    df = pd.read_csv(PEER_FILE)
    return df.to_dict(orient="records")

def get_saved_entity():
    if not SINGLE_FILE.exists():
        raise FileNotFoundError("No company data uploaded")
    df = pd.read_csv(SINGLE_FILE)
    return df['entity'].iloc[0]

def load_company_df():
    if not SINGLE_FILE.exists():
        raise FileNotFoundError("No company data uploaded")
    df = pd.read_csv(SINGLE_FILE, parse_dates=['period_end'])
    return df

def load_peer_trends(metric: str):
    if not PEER_FILE.exists():
        return []
    df = pd.read_csv(PEER_FILE)
    if "year" in df.columns:
        pivot = df.pivot_table(index="year", columns="entity", values=metric).reset_index()
        return pivot.to_dict(orient="records")
    return df.to_dict(orient="records")

def rank_peers(metric: str, higher_is_better: bool = True):
    if not PEER_FILE.exists():
        return []
    df = pd.read_csv(PEER_FILE)
    if "year" in df.columns:
        df = df[df["year"] == df["year"].max()]
    df = df[["entity", metric]].dropna()
    df = df.sort_values(by=metric, ascending=not higher_is_better).reset_index(drop=True)
    df["rank"] = df.index + 1
    return df.to_dict(orient="records")

