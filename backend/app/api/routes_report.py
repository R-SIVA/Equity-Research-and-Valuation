# app/api/routes_report.py
from fastapi import APIRouter
from fastapi.responses import Response
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    KeepTogether,
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use("Agg")
import pandas as pd
import numpy as np
import traceback

# Import your existing service functions
from app.services.valuation import compute_pb_target, compute_ddm_value
from app.services.ratios import compute_ratios_single
from app.services.ingest import load_peers, load_peer_trends, rank_peers

router = APIRouter(prefix="/report", tags=["Report"])


def fig_to_bytes(fig, fmt="png", dpi=150):
    buf = BytesIO()
    fig.savefig(buf, format=fmt, bbox_inches="tight", dpi=dpi)
    plt.close(fig)
    buf.seek(0)
    return buf

from reportlab.lib.colors import HexColor

def _header_footer(canvas_obj, doc):
    # header
    canvas_obj.saveState()
    canvas_obj.setFont("Helvetica", 9)
    header_text = "Equity Research & Valuation — Confidential"
    canvas_obj.drawString(doc.leftMargin, doc.height + doc.topMargin + 10, header_text)
    # footer / page number
    page_num_text = f"Page {doc.page}"
    canvas_obj.setFont("Helvetica", 9)
    canvas_obj.drawRightString(doc.pagesize[0] - doc.rightMargin, 20, page_num_text)
    canvas_obj.restoreState()

# add import at top if not already present
from app.services.models import forecast_metric

def make_time_series_chart(df, date_col, metric_col, title, forecast=None, horizon_q=8):
    """
    df: pandas DataFrame with date_col and metric_col (historical)
    forecast: optional; if None, try forecast_metric(metric_col) from backend models
    horizon_q: number of quarters to forecast when calling forecast_metric
    returns BytesIO PNG
    """
    fig, ax = plt.subplots(figsize=(7, 3.2))
    try:
        # historical
        if date_col in df.columns and metric_col in df.columns:
            x = pd.to_datetime(df[date_col])
            y = pd.to_numeric(df[metric_col], errors="coerce")
            ax.plot(x, y, marker="o", label="Historical", linewidth=1.5)

        # try to obtain forecast if none passed
        if forecast is None:
            try:
                fc = forecast_metric(metric_col, horizon_q)
                # forecast_metric returns a DataFrame-like with 'ds' and 'yhat' typically
                if hasattr(fc, "to_dict"):
                    forecast = fc.to_dict(orient="records")
                else:
                    forecast = fc  # if already list/dict
            except Exception:
                forecast = None

        # plot forecast
        if forecast:
            try:
                # handle list of dicts with 'ds' and 'yhat'
                if isinstance(forecast, (list, tuple)) and len(forecast) > 0 and isinstance(forecast[0], dict):
                    fx = pd.to_datetime([f.get("ds") for f in forecast])
                    fy = [f.get("yhat") for f in forecast]
                    ax.plot(fx, fy, linestyle="--", marker="o", label="Forecast", linewidth=1.25)
                elif isinstance(forecast, pd.DataFrame):
                    fx = pd.to_datetime(forecast["ds"])
                    fy = forecast["yhat"]
                    ax.plot(fx, fy, linestyle="--", marker="o", label="Forecast", linewidth=1.25)
            except Exception:
                pass

        ax.set_title(title)
        ax.set_xlabel("Date")
        ax.set_ylabel(metric_col)
        ax.grid(alpha=0.2)
        ax.legend()
    except Exception:
        ax.text(0.5, 0.5, "Chart unavailable", ha="center", va="center")
    return fig_to_bytes(fig)

def make_bar_allocation_chart(allocation: dict):
    fig, ax = plt.subplots(figsize=(6.5, 1.2))
    labels = ["Buy", "Hold", "Sell"]
    vals = [allocation.get("buy", 0), allocation.get("hold", 0), allocation.get("sell", 0)]
    colors_map = ["#2e7d32", "#6a1b9a", "#b71c1c"]
    ax.barh(labels, vals, color=colors_map)
    ax.set_xlim(0, 100)
    for i, v in enumerate(vals):
        ax.text(v + 1, i, f"{v}%", va="center")
    ax.set_title("Allocation (Buy / Hold / Sell)")
    ax.xaxis.set_visible(False)
    plt.box(False)
    return fig_to_bytes(fig)


def make_peer_pb_trend_chart(peer_trends):
    # peer_trends: list of dicts like [{ 'period': '2021-03-31', 'pb_ratio': 2.5, 'entity': 'Bank A'}, ...]
    try:
        df = pd.DataFrame(peer_trends)
        if df.empty:
            raise ValueError("No peer trend data")
        # pivot for multiple peers
        if "entity" in df.columns and "pb_ratio" in df.columns:
            pivot = df.pivot_table(index="period", columns="entity", values="pb_ratio")
            pivot.index = pd.to_datetime(pivot.index)
            fig, ax = plt.subplots(figsize=(7, 3.2))
            pivot.plot(ax=ax, linewidth=1)
            ax.set_title("Peer P/B Trends")
            ax.set_xlabel("Period")
            ax.set_ylabel("P/B")
            ax.grid(alpha=0.2)
            ax.legend(fontsize="small")
            return fig_to_bytes(fig)
    except Exception:
        fig, ax = plt.subplots(figsize=(6.5, 2.5))
        ax.text(0.5, 0.5, "Peer P/B trend chart unavailable", ha="center", va="center")
        return fig_to_bytes(fig)


@router.get("/download")
def download_equity_report():
    """
    Generate a rich PDF report in memory including tables, charts and dynamic commentary.
    """
    styles = getSampleStyleSheet()
    story = []

    # ----------------- Title -----------------
    story.append(Paragraph("<b>Equity Research & Valuation Report</b>", styles["Title"]))
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph("Auto-generated from dashboard analytics.", styles["Normal"]))
    story.append(Spacer(1, 0.25 * inch))
# after Title and intro paragraphs
    story.append(Paragraph("<b>Contents</b>", styles["Heading3"]))
    toc_rows = [
        ["1.", "P/B Valuation"],
        ["2.", "Key Ratios & Trend Charts"],
        ["3.", "Peer Comparison & Rankings"],
        ["4.", "DDM Valuation"],
        ["5.", "Appendix: Detailed Time-Series"]
    ]
    toc_table = Table(toc_rows, hAlign="LEFT", colWidths=[30, 400])
    toc_table.setStyle(TableStyle([("LEFTPADDING", (0,0), (-1,-1), 0), ("FONTNAME", (0,0), (-1,-1), "Helvetica")]))
    story.append(toc_table)
    story.append(Spacer(1, 0.2 * inch))

    # ----------------- P/B Valuation & Allocation -----------------
    try:
        pb = compute_pb_target()
    except Exception as e:
        pb = {"error": str(e)}
        traceback.print_exc()

    story.append(Paragraph("<b>1. P/B Valuation</b>", styles["Heading2"]))
    if pb and pb.get("error"):
        story.append(Paragraph(f"<b>Error:</b> {pb['error']}", styles["Normal"]))
    else:
        data = [
            ["Metric", "Value"],
            ["Peer Avg P/B", pb.get("peer_avg_pb")],
            ["Book Value/Share (BVPS)", pb.get("bvps")],
            ["Target Price (P/B * BVPS)", pb.get("target_price")],
            ["Current Market Price", pb.get("current_price")],
        ]
        t = Table(data, hAlign="LEFT", colWidths=[220, 120])
        t.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ]
            )
        )
        story.append(t)
        story.append(Spacer(1, 0.12 * inch))

        alloc = pb.get("allocation", {"buy": 0, "hold": 0, "sell": 0})
        story.append(Paragraph(f"<b>Allocation:</b> Buy {alloc['buy']}% | Hold {alloc['hold']}% | Sell {alloc['sell']}%", styles["Normal"]))
        story.append(Spacer(1, 0.1 * inch))

        # allocation chart
        try:
            alloc_img = make_bar_allocation_chart(alloc)
            story.append(RLImage(alloc_img, width=5.5 * inch, height=0.9 * inch))
        except Exception:
            pass

        # reason text
        reason_summary = pb.get("reason", {}).get("summary") if pb.get("reason") else None
        if reason_summary:
            story.append(Spacer(1, 0.12 * inch))
            story.append(Paragraph("<b>Rationale:</b> " + reason_summary, styles["Normal"]))

    story.append(Spacer(1, 0.25 * inch))

    # ----------------- Ratios and Time Series Charts -----------------
    story.append(Paragraph("<b>2. Key Ratios (Latest) & Trend Charts</b>", styles["Heading2"]))
    try:
        ratios_df = compute_ratios_single()
        if ratios_df is None or ratios_df.empty:
            story.append(Paragraph("No ratio data available.", styles["Normal"]))
        else:
            # Latest ratios table (select useful columns)
            latest = ratios_df.sort_values("period_end").iloc[-1]
            # Build table rows from expected fields
            table_rows = [
                ["Metric", "Latest Value"],
                ["NIM (%)", latest.get("nim_percent", "—")],
                ["GNPA (%)", latest.get("gnpa_percent", "—")],
                ["CASA (%)", latest.get("casa_percent", "—")],
                ["CAR (%)", latest.get("capital_adequacy_ratio", "—")],
                ["ROE (%)", latest.get("roe", "—")],
                ["BVPS", latest.get("bvps", "—")],
                ["DPS", latest.get("dps", "—")],
            ]
            t_rat = Table(table_rows, hAlign="LEFT", colWidths=[220, 120])
            t_rat.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                        ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ]
                )
            )
            story.append(t_rat)
            story.append(Spacer(1, 0.12 * inch))

            # time-series charts for NIM, GNPA, CASA
            try:
                nim_chart = make_time_series_chart(ratios_df, "period_end", "nim_percent", "NIM (%)")
                gnpa_chart = make_time_series_chart(ratios_df, "period_end", "gnpa_percent", "GNPA (%)")
                casa_chart = make_time_series_chart(ratios_df, "period_end", "casa_percent", "CASA (%)")
                story.append(KeepTogether([RLImage(nim_chart, width=6.5 * inch, height=2.7 * inch), Spacer(1, 0.12 * inch)]))
                story.append(KeepTogether([RLImage(gnpa_chart, width=6.5 * inch, height=2.7 * inch), Spacer(1, 0.12 * inch)]))
                story.append(KeepTogether([RLImage(casa_chart, width=6.5 * inch, height=2.7 * inch), Spacer(1, 0.12 * inch)]))
            except Exception:
                story.append(Paragraph("Trend charts unavailable.", styles["Normal"]))
            # Dynamic commentary for ratios
            try:
                comments = []
                # NIM commentary
                try:
                    hist_nim = pd.to_numeric(ratios_df["nim_percent"].dropna())
                    if len(hist_nim) >= 2:
                        nim_trend = np.sign(hist_nim.iloc[-1] - hist_nim.iloc[-3]) if len(hist_nim) >= 3 else np.sign(hist_nim.iloc[-1] - hist_nim.iloc[-2])
                        if nim_trend > 0:
                            comments.append("NIM shows an improving trend, which supports better margin outlook.")
                        elif nim_trend < 0:
                            comments.append("NIM is trending down — margin pressure may persist.")
                        else:
                            comments.append("NIM appears stable.")
                except Exception:
                    pass
                # GNPA commentary
                try:
                    hist_gnpa = pd.to_numeric(ratios_df["gnpa_percent"].dropna())
                    if len(hist_gnpa) >= 2:
                        gnpa_trend = np.sign(hist_gnpa.iloc[-1] - hist_gnpa.iloc[-3]) if len(hist_gnpa) >= 3 else np.sign(hist_gnpa.iloc[-1] - hist_gnpa.iloc[-2])
                        if gnpa_trend < 0:
                            comments.append("GNPA is improving — asset quality is getting better.")
                        elif gnpa_trend > 0:
                            comments.append("GNPA is worsening — watch asset quality closely.")
                        else:
                            comments.append("GNPA appears stable.")
                except Exception:
                    pass

                if comments:
                    story.append(Paragraph("<b>Observations:</b> " + " ".join(comments), styles["Normal"]))
            except Exception:
                pass

    except Exception as e:
        story.append(Paragraph("Error computing ratios: " + str(e), styles["Normal"]))
        traceback.print_exc()

    story.append(Spacer(1, 0.25 * inch))

    # ----------------- Peer Comparison & Rankings -----------------
    story.append(Paragraph("<b>3. Peer Comparison & Rankings</b>", styles["Heading2"]))
    try:
        peers = load_peers() or []
        if peers:
            # Build simple peer table with common metrics
            # peers expected as list of dicts
            rows = [["Entity", "PB Ratio", "ROE", "GNPA", "NIM"]]
            for p in peers:
                rows.append([
                    p.get("entity", "—"),
                    p.get("pb_ratio", "—"),
                    p.get("roe", "—"),
                    p.get("gnpa_percent", "—"),
                    p.get("nim_percent", "—"),
                ])
            t_peers = Table(rows, hAlign="LEFT", repeatRows=1, colWidths=[140, 80, 80, 80, 80])
            t_peers.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                        ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ]
                )
            )
            story.append(t_peers)
            story.append(Spacer(1, 0.12 * inch))
        else:
            story.append(Paragraph("Peer universe data not available.", styles["Normal"]))

        # Peer P/B trends (chart)
        try:
            peer_trends = load_peer_trends("pb_ratio") or []
            if peer_trends:
                pb_trend_img = make_peer_pb_trend_chart(peer_trends)
                story.append(RLImage(pb_trend_img, width=6.5 * inch, height=2.7 * inch))
                story.append(Spacer(1, 0.12 * inch))
        except Exception:
            pass

        # rankings
        try:
            # Example: top 5 by ROE and lowest GNPA
            roe_rank = rank_peers("roe", higher_is_better=True) or []
            gnpa_rank = rank_peers("gnpa_percent", higher_is_better=False) or []
            # Build ranking tables (top 5)
            if roe_rank:
                rows_r = [["Rank (ROE)", "Entity", "Value"]]
                for i, r in enumerate(roe_rank[:5], start=1):
                    rows_r.append([i, r.get("entity", "—"), r.get("value", "—")])
                t_r = Table(rows_r, hAlign="LEFT", colWidths=[80, 240, 120])
                t_r.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ]))
                story.append(t_r)
                story.append(Spacer(1, 0.12 * inch))
            if gnpa_rank:
                rows_g = [["Rank (Low GNPA)", "Entity", "Value"]]
                for i, r in enumerate(gnpa_rank[:5], start=1):
                    rows_g.append([i, r.get("entity", "—"), r.get("value", "—")])
                t_g = Table(rows_g, hAlign="LEFT", colWidths=[80, 240, 120])
                t_g.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ]))
                story.append(t_g)
                story.append(Spacer(1, 0.12 * inch))
        except Exception:
            pass

    except Exception as e:
        story.append(Paragraph("Error loading peers: " + str(e), styles["Normal"]))
        traceback.print_exc()

    story.append(Spacer(1, 0.25 * inch))

    # ----------------- DDM / Valuation Context -----------------
    story.append(Paragraph("<b>4. DDM Valuation</b>", styles["Heading2"]))
    try:
        ddm = compute_ddm_value()
        if ddm.get("error"):
            story.append(Paragraph("DDM Error: " + ddm.get("error", ""), styles["Normal"]))
        else:
            data3 = [
                ["Metric", "Value"],
                ["Growth Rate (g)", ddm.get("growth_rate")],
                ["Cost of Equity (ke)", ddm.get("cost_of_equity")],
                ["Dividend / Share (DPS)", ddm.get("dps")],
                ["Intrinsic Value (DDM)", ddm.get("intrinsic_value")],
            ]
            t3 = Table(data3, hAlign="LEFT", colWidths=[220, 120])
            t3.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ]))
            story.append(t3)
            story.append(Spacer(1, 0.12 * inch))

            # dynamic note
            note = []
            # compare ddm intrinsic vs pb target if both available
            try:
                if pb and not pb.get("error") and ddm.get("intrinsic_value"):
                    tp = float(pb.get("target_price") or 0)
                    dv = float(ddm.get("intrinsic_value") or 0)
                    if dv > tp * 1.05:
                        note.append("DDM intrinsic value is materially higher than P/B target — dividend-driven valuation suggests upside.")
                    elif dv < tp * 0.95:
                        note.append("DDM intrinsic value is materially lower than P/B target — dividend perspective is more conservative.")
                    else:
                        note.append("DDM and P/B valuations are broadly in line.")
            except Exception:
                pass
            if note:
                story.append(Paragraph("<b>Valuation Note:</b> " + " ".join(note), styles["Normal"]))
    except Exception as e:
        story.append(Paragraph("Error computing DDM: " + str(e), styles["Normal"]))
        traceback.print_exc()

    story.append(Spacer(1, 0.25 * inch))

    # ----------------- Appendix / Detailed Tables -----------------
    story.append(Paragraph("<b>5. Appendix: Detailed Time-Series (Recent)</b>", styles["Heading2"]))
    try:
        if "ratios_df" in locals() and not ratios_df.empty:
            # include last N rows as table (cap to 12 rows)
            df_show = ratios_df.sort_values("period_end").tail(12)
            # build table header
            header = ["Period", "NIM", "GNPA", "CASA", "CAR", "ROE", "BVPS", "DPS"]
            rows = [header]
            for _, row in df_show.iterrows():
                rows.append([
                    str(row.get("period_end")),
                    row.get("nim_percent"),
                    row.get("gnpa_percent"),
                    row.get("casa_percent"),
                    row.get("capital_adequacy_ratio"),
                    row.get("roe"),
                    row.get("bvps"),
                    row.get("dps"),
                ])
            t_append = Table(rows, hAlign="LEFT", repeatRows=1, colWidths=[80, 55, 55, 55, 55, 55, 65, 50])
            t_append.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("GRID", (0,0), (-1,-1), 0.25, colors.grey),
                ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold")
            ]))
            story.append(t_append)
    except Exception:
        pass

    # ----------------- Build PDF in memory -----------------
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=36, leftMargin=36, topMargin=72, bottomMargin=36)

    try:
        doc.build(story, onFirstPage=_header_footer, onLaterPages=_header_footer)
    except Exception as e:
        # fallback: build a minimal PDF instead of crashing
        buffer = BytesIO()
        from reportlab.pdfgen import canvas
        c = canvas.Canvas(buffer, pagesize=A4)
        c.drawString(72, 800, "PDF generation error - see logs")
        c.drawString(72, 780, str(e))
        c.showPage()
        c.save()

    pdf_bytes = buffer.getvalue()
    buffer.close()
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=Equity_Research_Report.pdf"})




