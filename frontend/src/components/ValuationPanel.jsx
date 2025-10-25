// import React, {useState} from "react";
// import axios from "axios";

// export default function ValuationPanel({onRecommendation}){
//   const [peerPb, setPeerPb] = useState(3.0);
//   const [pbResult, setPbResult] = useState(null);
//   const [ddmInputs, setDdmInputs] = useState({g:0.02, ke:0.10});
//   const [ddmResult, setDdmResult] = useState(null);

//   const computePb = async () => {
//     try{
//       // const form = new URLSearchParams();
//       // form.append("peer_avg_pb", peerPb);

//       console.log({"peer_avg_pb" : peerPb});
//       const res = await axios.post("http://127.0.0.1:8000/api/valuation/pb", {"peer_avg_pb" : peerPb});
//       setPbResult(res.data);
//       console.log(res);
//       if(onRecommendation && res.data.recommendation) onRecommendation(res.data.recommendation);
//     }catch(e){
//       alert("PB error: " + (e.response?.data?.detail || e.message));
//     }
//   }

//   const computeDdm = async () => {
//     try{
//       const res = await axios.post("http://127.0.0.1:8000/api/valuation/ddm", {"g": ddmInputs.g,"ke":ddmInputs.ke});
//       console.log(res);
//       setDdmResult(res.data);
//     }catch(e){
//       alert("DDM error: " + (e.response?.data?.detail || e.message));
//     }
//   }

//   return (
//     <div style={{paddingLeft:20,paddingBottom:20,paddingRight:20, border:"1px solid #ddd", borderRadius:8, background:"#c2ffd9ff", boxShadow:"0 4px 8px rgba(0,0,0,0.1)"}}>
//       <h2 style={{color:"#333", marginBottom:0}}>Valuation</h2>
//       <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:12, marginTop:32}}>
//       <div style={{marginBottom:10}}>
//         <label style={{fontWeight:600,marginTop:8, marginRight:8}}>Peer avg P/B: </label><br/>
//         <input type="number" value={peerPb} onChange={e=>setPeerPb(e.target.value)} style={{padding:8, marginTop:8, borderRadius:4, border:"1px solid #ccc"}} /><br/>
//         <button onClick={computePb} style={{marginTop:8, padding:"8px 16px", background:"#4CAF50", color:"white", border:"none", borderRadius:4, cursor:"pointer"}}>Compute P/B Target</button>
//       </div>
//       {pbResult && (
//         <div style={{padding:12, background:"#fff", borderRadius:8, border:"1px solid #eee", boxShadow:"0 2px 4px rgba(0,0,0,0.1)"}}>
//           <div>BVPS: {Number(pbResult.bvps).toFixed(2)}</div>
//           <div>Target Price: {Number(pbResult.target_price).toFixed(2)}</div>
//           <div>Current Price: {pbResult.current_price || "N/A"}</div>
//           <div>Recommendation: {pbResult.recommendation || "N/A"}</div>
//         </div>
//       )}
//       </div>
//       <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:12, marginTop:0}}>
//       <div style={{marginTop:0}}>
//         <h3 style={{color:"#555", marginBottom:8}}>DDM (Gordon)</h3>
//         <div style={{marginBottom:8}}>g: <input type="number" step="0.01" value={ddmInputs.g} onChange={e=>setDdmInputs({...ddmInputs,g:parseFloat(e.target.value)})} style={{padding:8, borderRadius:4, border:"1px solid #ccc"}} /></div>
//         <div>ke: <input type="number" step="0.01" value={ddmInputs.ke} onChange={e=>setDdmInputs({...ddmInputs,ke:parseFloat(e.target.value)})} style={{padding:8, borderRadius:4, border:"1px solid #ccc"}} /></div>
//         <button onClick={computeDdm} style={{marginTop:8, padding:"8px 16px", background:"#4CAF50", color:"white", border:"none", borderRadius:4, cursor:"pointer"}}>Compute DDM</button>
//         </div>
//         {ddmResult && <div style={{maxHeight:50, marginTop:20, padding:12, background:"#fff", borderRadius:8, border:"1px solid #eee", boxShadow:"0 2px 4px rgba(0,0,0,0.1)"}}>DDM Value: {Number(ddmResult.intrinsic_value).toFixed(2)}</div>}
      
//       </div>
      
//     </div>
//   )
// }


import React, { useState } from "react";
import axios from "axios";

export default function ValuationPanel({ onRecommendation }) {
  const [peerPb, setPeerPb] = useState(3.0);
  const [pbResult, setPbResult] = useState(null);
  const [ddmInputs, setDdmInputs] = useState({ g: 0.02, ke: 0.10 });
  const [ddmResult, setDdmResult] = useState(null);

  const computePb = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/valuation/pb", { peer_avg_pb: peerPb });
      setPbResult(res.data);
      if (onRecommendation && res.data.recommendation) onRecommendation(res.data.recommendation);
    } catch (e) {
      alert("PB error: " + (e.response?.data?.detail || e.message));
    }
  };

  const computeDdm = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/valuation/ddm", { g: ddmInputs.g, ke: ddmInputs.ke });
      setDdmResult(res.data);
    } catch (e) {
      alert("DDM error: " + (e.response?.data?.detail || e.message));
    }
  };

  return (
    <div
      // style={{
      //   background: "linear-gradient(135deg, #d4fc79, #96e6a1)",
      //   borderRadius: 16,
      //   paddingLeft: 15,
      //   paddingBottom: 15,
      //   paddingRight: 15,
      //   paddingTop: 2,
      //   boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
      // }}
    >
      <h2 style={{ color: "#1b4332", marginBottom: 20, textAlign: "center" }}>📊 Valuation Models</h2>

      {/* P/B Valuation Section */}
    <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:12}}>
      <div
        style={{
          background: "rgba(255,255,255,0.9)",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: 24,
          transition: "transform 0.2s ease",
        }}
      >
        <h3 style={{ color: "#2c3e50", marginBottom: 12 }}>P/B Valuation</h3>
        <label style={{ fontWeight: 600 }}>Peer Avg P/B Ratio</label>
        <input
          type="number"
          value={peerPb}
          onChange={(e) => setPeerPb(e.target.value)}
          style={{
            width: "70%",
            padding: 10,
            marginTop: 8,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 14,
          }}
        />
        <button
          onClick={computePb}
          style={{
            marginTop: 12,
            padding: "10px 16px",
            background: "linear-gradient(90deg, #11998e, #38ef7d)",
            color: "#fff",
            fontWeight: 600,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            width: "100%",
            transition: "0.3s",
          }}
        >
          ⚙️ Compute P/B Target
        </button>
        </div>
        {pbResult && (
          <div
            style={{
              background: "#f8f9fa",
              borderRadius: 10,
              padding: 16,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              fontSize: 14,
              height:100
            }}
          >
            <div><b>BVPS:</b> ₹ {Number(pbResult.bvps).toFixed(2)}</div>
            <div><b>Target Price:</b> ₹ {Number(pbResult.target_price).toFixed(2)}</div>
            <div><b>Current Price:</b> ₹ {pbResult.current_price || "N/A"}</div>
            <div>
              <b>Recommendation:</b>{" "}
              <span
                style={{
                  color:
                    pbResult.recommendation === "BUY"
                      ? "#1B5E20"
                      : pbResult.recommendation === "SELL"
                      ? "#B71C1C"
                      : "#6A1B9A",
                  fontWeight: 700,
                }}
              >
                {pbResult.recommendation || "N/A"}
              </span>
            </div>
          </div>
        )}

        </div>
      
      {/* DDM Section */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:12}}>
        
      <div
        style={{
          background: "rgba(255,255,255,0.9)",
          borderRadius: 12,
          padding: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ color: "#2c3e50", marginBottom: 12 }}>DDM</h3>
        <div style={{ gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 600 }}>Growth Rate (g)</label>
            <input
              type="number"
              step="0.01"
              value={ddmInputs.g}
              onChange={(e) => setDdmInputs({ ...ddmInputs, g: parseFloat(e.target.value) })}
              style={{
                width: "70%",
                padding: 10,
                marginTop: 6,
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />
          </div><br/>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 600 }}>Cost of Equity (ke)</label>
            <input
              type="number"
              step="0.01"
              value={ddmInputs.ke}
              onChange={(e) => setDdmInputs({ ...ddmInputs, ke: parseFloat(e.target.value) })}
              style={{
                width: "70%",
                padding: 10,
                marginTop: 6,
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />
          </div>
        </div>
        <button
          onClick={computeDdm}
          style={{
            marginTop: 12,
            padding: "10px 16px",
            background: "linear-gradient(90deg, #396afc, #2948ff)",
            color: "#fff",
            fontWeight: 600,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            width: "100%",
            transition: "0.3s",
          }}
        >
          📊 Compute DDM
        </button>
</div>
<div>
        {ddmResult && (
          <div
            style={{
              background: "#f1f8e9",
              borderRadius: 10,
              padding: 16,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              textAlign: "center",
              fontWeight: 700,
              color: "#2E7D32",
            }}
          >
            Intrinsic Value: ₹ {Number(ddmResult.intrinsic_value).toFixed(2)}
          </div>
        )}
      </div>
      </div>
      </div>
    
  );
}
