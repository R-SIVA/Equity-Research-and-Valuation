from app.services.ingest import load_company_df
import pandas as pd

def compute_ratios_single():
    df = load_company_df().copy()
    
    # Basic ratios
    df['casa_amount'] = df.get('casa_amount', df.get('current_account', 0).fillna(0) + df.get('savings_account', 0).fillna(0))
    df['casa_percent'] = df['casa_amount'] / df['total_deposits'] * 100
    
    # Profitability ratios
    df['nii'] = df['interest_income'] - df['interest_expense']
    denom = df['total_assets'].where(df['total_assets'].notna(), df['gross_advances'] + df['total_deposits'])
    df['nim_percent'] = df['nii'] / denom * 100
    df['roe'] = df['net_profit'] / df['shareholders_equity'] * 100
    df['cost_to_income'] = df['operating_expenses'] / (df['nii'] + df['non_interest_income']) * 100
    
    # Asset quality ratios
    df['gnpa_percent'] = df['gross_npa_amount'] / df['gross_advances'] * 100
    df['nnpa_percent'] = df['net_npa_amount'] / df['net_advances'] * 100
    df['pcr'] = (df['gross_npa_amount'] - df['net_npa_amount']) / df['gross_npa_amount'] * 100  # Provision Coverage Ratio
    
    # Capital adequacy
    if 'tier_1_capital' in df.columns and 'rwa' in df.columns:
        df['tier_1_ratio'] = df['tier_1_capital'] / df['rwa'] * 100
    
    # Valuation metrics
    df['bvps'] = df['shareholders_equity'] / df['number_of_shares']
    if 'market_price' in df.columns:
        df['pb_ratio'] = df['market_price'] / df['bvps']
        df['market_cap'] = df['market_price'] * df['number_of_shares']
    # Stay with selected output
    out_cols = ['entity','period_end','nim_percent','gnpa_percent','casa_percent','capital_adequacy_ratio','bvps','dps']
    # ensure columns exist
    for c in out_cols:
        if c not in df.columns:
            df[c] = None
    return df[out_cols].sort_values('period_end')
