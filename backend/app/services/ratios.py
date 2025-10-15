from app.services.ingest import load_company_df
import pandas as pd

def compute_ratios_single():
    df = load_company_df().copy()
    # CASA
    df['casa_amount'] = df.get('casa_amount', df.get('current_account', 0).fillna(0) + df.get('savings_account', 0).fillna(0))
    df['casa_percent'] = df['casa_amount'] / df['total_deposits'] * 100
    # NII, NIM
    df['nii'] = df['interest_income'] - df['interest_expense']
    # Use total_assets if present, else gross_advances + investments heuristic
    denom = df['total_assets'].where(df['total_assets'].notna(), df['gross_advances'] + df['total_deposits'])
    df['nim_percent'] = df['nii'] / denom * 100
    # GNPA
    df['gnpa_percent'] = df['gross_npa_amount'] / df['gross_advances'] * 100
    # BVPS
    df['bvps'] = df['shareholders_equity'] / df['number_of_shares']
    # Stay with selected output
    out_cols = ['entity','period_end','nim_percent','gnpa_percent','casa_percent','capital_adequacy_ratio','bvps','dps']
    # ensure columns exist
    for c in out_cols:
        if c not in df.columns:
            df[c] = None
    return df[out_cols].sort_values('period_end')
