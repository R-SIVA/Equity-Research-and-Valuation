// import React, {useEffect, useState} from "react";
// import axios from "axios";
// import TrendChart from "./TrendChart";
// import KpiCard from "./KpiCard";
// import ValuationPanel from "./ValuationPanel";

// export default function Dashboard(){
//   const [ratios, setRatios] = useState([]);
//   const [recommendation, setRecommendation] = useState(null);
//   const [forecasts, setForecasts] = useState({nim:[], gnpa:[], casa:[]});

//   useEffect(()=>{
//     loadData();
//   },[]);

//   async function loadData(){
//     try{
//       const r = await axios.get("http://127.0.0.1:8000/api/ratios");
//       setRatios(r.data.ratios);
//     }catch(e){
//       console.error("Could not load ratios", e);
//     }
//   }

//   const handleTrainAndForecast = async () => {
//     try{
//       // request forecast for each metric
//       const nimFc = await axios.get("http://127.0.0.1:8000/api/forecast?metric=nim&horizon_q=8");
//       const gnpaFc = await axios.get("http://127.0.0.1:8000/api/forecast?metric=gnpa&horizon_q=8");
//       const casaFc = await axios.get("http://127.0.0.1:8000/api/forecast?metric=casa&horizon_q=8");
//       setForecasts({nim: nimFc.data.forecast, gnpa: gnpaFc.data.forecast, casa: casaFc.data.forecast});
//     }catch(e){
//       alert("Forecast error: " + (e.response?.data?.detail || e.message));
//     }
//   }

//   const latest = ratios.length > 0 ? ratios[ratios.length-1] : {};

//   return (
//     <div style={{marginTop:14}}>
//       <div style={{display:"flex", gap:16}}>
//         <div style={{flex:1}}>
//           <h3>Executive Summary</h3>
//           <div style={{padding:12, background:"#fff", borderRadius:8, border:"1px solid #eee"}}>
//             <div>Recommendation: <b>{recommendation || "N/A"}</b></div>
//             <div>Latest BVPS: {latest?.bvps ? Number(latest.bvps).toFixed(2) : "N/A"}</div>
//             <div>Latest DPS: {latest?.dps ?? "N/A"}</div>
//             <div style={{marginTop:8}}>
//               <button onClick={handleTrainAndForecast} style={{padding:"8px 12px"}}>Compute Forecasts</button>
//             </div>
//           </div>
//         </div>

//         <div style={{width:360}}>
//           <ValuationPanel onRecommendation={(rec)=>setRecommendation(rec)} />
//         </div>
//       </div>

//       <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12, marginTop:16}}>
//         <KpiCard title="NIM" value={latest?.nim_percent} />
//         <KpiCard title="GNPA" value={latest?.gnpa_percent} />
//         <KpiCard title="CASA" value={latest?.casa_percent} />
//         <KpiCard title="CAR" value={latest?.capital_adequacy_ratio} />
//       </div>

//       <h3 style={{marginTop:18}}>Trends (historical + forecast)</h3>
//       <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
//         <TrendChart data={ratios} metric="nim_percent" title="NIM (%)" forecast={forecasts.nim} />
//         <TrendChart data={ratios} metric="gnpa_percent" title="GNPA (%)" forecast={forecasts.gnpa} />
//         <TrendChart data={ratios} metric="casa_percent" title="CASA (%)" forecast={forecasts.casa} />
//         <TrendChart data={ratios} metric="capital_adequacy_ratio" title="CAR (%)" forecast={[]} />
//       </div>
//     </div>
//   )
// }

import React, {useEffect, useState} from "react";
import axios from "axios";
import TrendChart from "./TrendChart";
import KpiCard from "./KpiCard";
import ValuationPanel from "./ValuationPanel";
import PeerTable from "./PeerTable";

import PeerTrendChart from "./PeerTrendChart";
import PeerRanking from "./PeerRanking";

export default function Dashboard(){
  const [ratios, setRatios] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [forecasts, setForecasts] = useState({nim:[], gnpa:[], casa:[]});
  const [pbTrend, setPbTrend] = useState([]);
  const [roeTrend, setRoeTrend] = useState([]);
  const [gnpaTrend, setGnpaTrend] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/peers/trend?metric=pb_ratio").then(res => setPbTrend(res.data));
    axios.get("http://127.0.0.1:8000/api/peers/trend?metric=roe").then(res => setRoeTrend(res.data));
    axios.get("http://127.0.0.1:8000/api/peers/trend?metric=gnpa_percent").then(res => setGnpaTrend(res.data));
  }, []);


  useEffect(()=>{
    loadData();
  },[]);

  async function loadData(){
    try{
      const r = await axios.get("http://127.0.0.1:8000/api/ratios");
      setRatios(r.data.ratios);
    }catch(e){
      console.error("Could not load ratios", e);
    }
  }

  const handleTrainAndForecast = async () => {
    try{
      const nimFc = await axios.get("http://127.0.0.1:8000/api/forecast?metric=nim&horizon_q=8");
      const gnpaFc = await axios.get("http://127.0.0.1:8000/api/forecast?metric=gnpa&horizon_q=8");
      const casaFc = await axios.get("http://127.0.0.1:8000/api/forecast?metric=casa&horizon_q=8");
      setForecasts({nim: nimFc.data.forecast, gnpa: gnpaFc.data.forecast, casa: casaFc.data.forecast});
    }catch(e){
      alert("Forecast error: " + (e.response?.data?.detail || e.message));
    }
  }

  const latest = ratios.length > 0 ? ratios[ratios.length-1] : {};

  return (
    <div style={{marginTop:14}}>
      <div style={{display:"flex", gap:16}}>
        <div style={{flex:1}}>
          <h3>Executive Summary</h3>
          <div style={{padding:12, background:"#ffffffff", borderRadius:8, border:"1px solid #eee"}}>
            <div>Recommendation: <b>{recommendation || "N/A"}</b></div>
            <div>Latest BVPS: {latest?.bvps ? Number(latest.bvps).toFixed(2) : "N/A"}</div>
            <div>Latest DPS: {latest?.dps ?? "N/A"}</div>
            <div style={{marginTop:8}}>
              <button onClick={handleTrainAndForecast} style={{padding:"8px 12px"}}>Compute Forecasts</button>
            </div>
          </div>
        </div>

        <div style={{width:360}}>
          <ValuationPanel onRecommendation={(rec)=>setRecommendation(rec)} />
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12, marginTop:16}}>
        <KpiCard title="NIM" value={latest?.nim_percent} />
        <KpiCard title="GNPA" value={latest?.gnpa_percent} />
        <KpiCard title="CASA" value={latest?.casa_percent} />
        <KpiCard title="CAR" value={latest?.capital_adequacy_ratio} />
      </div>

      <h3 style={{marginTop:18}}>Trends (historical + forecast)</h3>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
        <TrendChart data={ratios} metric="nim_percent" title="NIM (%)" forecast={forecasts.nim} />
        <TrendChart data={ratios} metric="gnpa_percent" title="GNPA (%)" forecast={forecasts.gnpa} />
        <TrendChart data={ratios} metric="casa_percent" title="CASA (%)" forecast={forecasts.casa} />
        <TrendChart data={ratios} metric="capital_adequacy_ratio" title="CAR (%)" forecast={[]} />
      </div>

      <PeerTable />

      <div style={{ padding: "20px" }}>
      {/* Peer trends */}
      <PeerTrendChart data={pbTrend} metric="pb_ratio" />
      <PeerTrendChart data={roeTrend} metric="roe" />
      <PeerTrendChart data={gnpaTrend} metric="gnpa_percent" />

      {/* Peer rankings */}
      <PeerRanking metric="pb_ratio" higherIsBetter={false} />
      <PeerRanking metric="roe" higherIsBetter={true} />
      <PeerRanking metric="gnpa_percent" higherIsBetter={false} />
      <PeerRanking metric="car" higherIsBetter={true} />
    </div>
    </div>
  )
}
