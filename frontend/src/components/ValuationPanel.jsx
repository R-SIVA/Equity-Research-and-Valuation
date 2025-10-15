import React, {useState} from "react";
import axios from "axios";

export default function ValuationPanel({onRecommendation}){
  const [peerPb, setPeerPb] = useState(3.0);
  const [pbResult, setPbResult] = useState(null);
  const [ddmInputs, setDdmInputs] = useState({g:0.02, ke:0.10});
  const [ddmResult, setDdmResult] = useState(null);

  const computePb = async () => {
    try{
      const form = new URLSearchParams();
      form.append("peer_avg_pb", peerPb);
      const res = await axios.post("http://127.0.0.1:8000/api/valuation/pb", form);
      setPbResult(res.data);
      if(onRecommendation && res.data.recommendation) onRecommendation(res.data.recommendation);
    }catch(e){
      alert("PB error: " + (e.response?.data?.detail || e.message));
    }
  }

  const computeDdm = async () => {
    try{
      const form = new URLSearchParams();
      form.append("g", ddmInputs.g);
      form.append("ke", ddmInputs.ke);
      const res = await axios.post("http://127.0.0.1:8000/api/valuation/ddm", form);
      setDdmResult(res.data);
    }catch(e){
      alert("DDM error: " + (e.response?.data?.detail || e.message));
    }
  }

  return (
    <div style={{padding:12, border:"1px solid #ddd", borderRadius:8, background:"#fff"}}>
      <div style={{fontWeight:700}}>Valuation</div>
      <div style={{marginTop:8}}>
        <div style={{marginBottom:6}}>Peer avg P/B: <input type="number" value={peerPb} onChange={e=>setPeerPb(e.target.value)} style={{width:80}} /></div>
        <button onClick={computePb} style={{padding:"6px 10px"}}>Compute P/B Target</button>
      </div>
      {pbResult && (
        <div style={{marginTop:8}}>
          <div>BVPS: {Number(pbResult.bvps).toFixed(2)}</div>
          <div>Target Price: {Number(pbResult.target_price).toFixed(2)}</div>
          <div>Current Price: {pbResult.current_price || "N/A"}</div>
          <div>Recommendation: {pbResult.recommendation || "N/A"}</div>
        </div>
      )}

      <div style={{marginTop:12}}>
        <div style={{fontWeight:700}}>DDM (Gordon)</div>
        <div style={{marginTop:6}}>g: <input type="number" step="0.01" value={ddmInputs.g} onChange={e=>setDdmInputs({...ddmInputs,g:parseFloat(e.target.value)})} style={{width:80}} /></div>
        <div>ke: <input type="number" step="0.01" value={ddmInputs.ke} onChange={e=>setDdmInputs({...ddmInputs,ke:parseFloat(e.target.value)})} style={{width:80}} /></div>
        <button onClick={computeDdm} style={{marginTop:8, padding:"6px 10px"}}>Compute DDM</button>
        {ddmResult && <div style={{marginTop:8}}>DDM Value: {Number(ddmResult.ddm_value).toFixed(2)}</div>}
      </div>
    </div>
  )
}
