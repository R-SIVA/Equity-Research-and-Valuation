import React, { useEffect, useState } from "react";
import axios from "axios";
import TrendChart from "./TrendChart";
import KpiCard from "./KpiCard";
import ValuationPanel from "./ValuationPanel";
import PeerTable from "./PeerTable";
import PeerTrendChart from "./PeerTrendChart";
import PeerRanking from "./PeerRanking";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [ratios, setRatios] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [forecasts, setForecasts] = useState({ nim: [], gnpa: [], casa: [] });
  const [pbTrend, setPbTrend] = useState([]);
  const [roeTrend, setRoeTrend] = useState([]);
  const [gnpaTrend, setGnpaTrend] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/peers/trend?metric=pb_ratio").then(res => setPbTrend(res.data));
    axios.get("http://127.0.0.1:8000/api/peers/trend?metric=roe").then(res => setRoeTrend(res.data));
    axios.get("http://127.0.0.1:8000/api/peers/trend?metric=gnpa_percent").then(res => setGnpaTrend(res.data));
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const r = await axios.get("http://127.0.0.1:8000/api/ratios");
      setRatios(r.data.ratios);
    } catch (e) {
      console.error("Could not load ratios", e);
    }
  }
  const uploadpage=()=>{
 navigate("/upload");
  }
  const handleTrainAndForecast = async () => {
    try {
      const nimFc = await axios.get("http://127.0.0.1:8000/api/forecast?metric=nim&horizon_q=8");
      const gnpaFc = await axios.get("http://127.0.0.1:8000/api/forecast?metric=gnpa&horizon_q=8");
      const casaFc = await axios.get("http://127.0.0.1:8000/api/forecast?metric=casa&horizon_q=8");
      setForecasts({ nim: nimFc.data.forecast, gnpa: gnpaFc.data.forecast, casa: casaFc.data.forecast });
    } catch (e) {
      alert("Forecast error: " + (e.response?.data?.detail || e.message));
    }
  };

  const latest = ratios.length > 0 ? ratios[ratios.length - 1] : {};

  return (
    <div
      style={{
        padding: 32,
        background: "linear-gradient(135deg, #e3f2fd, #fce4ec)",
        borderRadius: 20,
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        
      }}
    >
      <button
              onClick={uploadpage}
              style={{
                marginleft: 16,
                float:"right",
                padding: "10px 18px",
                background: "linear-gradient(90deg, #ec9595ff, #ff3030ff)",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                transition: "0.3s",
              }}
              onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseOut={e => e.currentTarget.style.transform = "scale(1.0)"}
            >
              Upload Financial Data
            </button>
      <h2
        style={{
          color: "#2c3e50",
          fontSize: 28,
          fontWeight: 700,
          textAlign: "center",
          marginBottom: 30,
          textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        📊 Company Performance Dashboard
      </h2>

      {/* Top summary section */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 28,
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {/* KPI + Summary Section */}
        <div
          style={{
            flex: 1,
            minWidth: 320,
            background: "linear-gradient(135deg, #f8f9fa, #e3f2fd)",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h3 style={{ color: "#34495e", marginBottom: 16 }}>Executive Summary</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(180px, 1fr))",
              gap: 18,
              marginBottom: 20,
            }}
          >
            <KpiCard title="NIM" value={latest?.nim_percent} />
            <KpiCard title="GNPA" value={latest?.gnpa_percent} />
            <KpiCard title="CASA" value={latest?.casa_percent} />
            <KpiCard title="CAR" value={latest?.capital_adequacy_ratio} />
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #ffffff, #e8f5e9)",
              padding: 20,
              borderRadius: 12,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ color: "#2c3e50", marginBottom: 12 }}>Summary</h3>
            <div style={{ lineHeight: "1.8em", fontSize: 15 }}>
              <div>Recommendation: <b style={{ color: "#1b5e20" }}>{recommendation || "N/A"}</b></div>
              <div>Latest BVPS: {latest?.bvps ? Number(latest.bvps).toFixed(2) : "N/A"}</div>
              <div>Latest DPS: {latest?.dps ?? "N/A"}</div>
            </div>
            <button
              onClick={handleTrainAndForecast}
              style={{
                marginTop: 16,
                padding: "10px 18px",
                background: "linear-gradient(90deg, #42a5f5, #7e57c2)",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                transition: "0.3s",
              }}
              onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseOut={e => e.currentTarget.style.transform = "scale(1.0)"}
            >
              🔮 Compute Forecasts
            </button>
          </div>
        </div>

        {/* Valuation Panel */}
        <div
          style={{
            flex: 1,
            minWidth: 320,
            background: "linear-gradient(135deg, #f1f8e9, #e8eaf6)",
            borderRadius: 18,
            padding: 10,
            paddingTop:0,
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          }}
        >
          <ValuationPanel onRecommendation={(rec) => setRecommendation(rec)} />
        </div>
      </div>

      {/* Charts */}
      <h3
        style={{
          marginTop: 50,
          color: "#2c3e50",
          textAlign: "center",
          fontWeight: 700,
          fontSize: 22,
        }}
      >
        📈 Trends (Historical + Forecast)
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: 28,
          marginTop: 24,
        }}
      >
        <TrendChart data={ratios} metric="nim_percent" title="NIM (%)" forecast={forecasts.nim} />
        <TrendChart data={ratios} metric="gnpa_percent" title="GNPA (%)" forecast={forecasts.gnpa} />
        <TrendChart data={ratios} metric="casa_percent" title="CASA (%)" forecast={forecasts.casa} />
        <TrendChart data={ratios} metric="capital_adequacy_ratio" title="CAR (%)" forecast={[]} />
      </div>

      {/* Peer Comparisons */}
      <h3
        style={{
          marginTop: 50,
          color: "#1a237e",
          textAlign: "center",
          fontWeight: 700,
          fontSize: 22,
        }}
      >
        🤝 Peer Comparisons
      </h3>

      <PeerTable />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 28, marginTop: 32 }}>
        <PeerTrendChart data={pbTrend} metric="pb_ratio" />
        <PeerTrendChart data={roeTrend} metric="roe" />
        <PeerTrendChart data={gnpaTrend} metric="gnpa_percent" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: 28,
          marginTop: 32,
          marginBottom: 30,
        }}
      >
        <PeerRanking metric="pb_ratio" higherIsBetter={false} />
        <PeerRanking metric="roe" higherIsBetter={true} />
        <PeerRanking metric="gnpa_percent" higherIsBetter={false} />
        <PeerRanking metric="car" higherIsBetter={true} />
      </div>
    </div>
  );
}
