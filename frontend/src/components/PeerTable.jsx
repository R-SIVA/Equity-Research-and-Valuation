// import React, {useEffect, useState} from "react";
// import axios from "axios";

// export default function PeerTable(){
//   const [peers, setPeers] = useState([]);

//   useEffect(()=>{
//     async function load(){
//       try{
//         const res = await axios.get("http://127.0.0.1:8000/api/peers");
//         setPeers(res.data);
//       }catch(e){ console.error(e); }
//     }
//     load();
//   },[]);

//   if(!peers.length) return <div style={{marginTop:10}}>No peer data uploaded.</div>

//   return (
//     <div style={{marginTop:20, background:"#f9f9f9", padding:20, borderRadius:8, boxShadow:"0 4px 8px rgba(0,0,0,0.1)"}}>
//       <h3 style={{color:"#333", marginBottom:16}}>Peer Comparison</h3>
//       <table style={{borderCollapse:"collapse", width:"100%", marginTop:10}}>
//         <thead>
//           <tr style={{background:"#f6f6f6"}}>
//             <th style={th}>Entity</th>
//             <th style={th}>P/B</th>
//             <th style={th}>ROE</th>
//             <th style={th}>GNPA%</th>
//             <th style={th}>CAR%</th>
//             <th style={th}>Market Cap</th>
//           </tr>
//         </thead>
//         <tbody>
//           {peers.map((p,i)=>(
//             <tr key={i}>
//               <td style={td}>{p.entity}</td>
//               <td style={td}>{p.pb_ratio}</td>
//               <td style={td}>{p.roe}</td>
//               <td style={td}>{p.gnpa_percent}</td>
//               <td style={td}>{p.car}</td>
//               <td style={td}>{p.market_cap}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   )
// }

// const th = {border:"1px solid #ccc", padding:"6px", fontWeight:"bold", fontSize:13};
// const td = {border:"1px solid #ccc", padding:"6px", fontSize:13};


import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PeerTable() {
  const [peers, setPeers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/peers");
        setPeers(res.data);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  if (!peers.length)
    return (
      <div
        style={{
          marginTop: 20,
          textAlign: "center",
          color: "#6c757d",
          fontStyle: "italic",
        }}
      >
        No peer data uploaded.
      </div>
    );

  return (
    <div
      style={{
        marginTop: 20,
        background:
          "linear-gradient(135deg, rgba(227, 242, 253, 0.95), rgba(252, 228, 236, 0.95))",
        padding: 24,
        borderRadius: 20,
        boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
        transition: "transform 0.2s ease, box-shadow 0.3s ease",
        backdropFilter: "blur(6px)",
      }}
    >
      <h3
        style={{
          color: "#283593",
          textAlign: "center",
          marginBottom: 18,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.4px",
          textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        Peer Comparison
      </h3>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "separate",
            borderSpacing: "0 8px",
            width: "100%",
            textAlign: "center",
            fontSize: 14,
            color: "#37474f",
          }}
        >
          <thead>
            <tr
              style={{
                background:
                  "linear-gradient(90deg, #90caf9 0%, #f48fb1 100%)",
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              <th style={th}>Entity</th>
              <th style={th}>P/B</th>
              <th style={th}>ROE</th>
              <th style={th}>GNPA%</th>
              <th style={th}>CAR%</th>
              <th style={th}>Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {peers.map((p, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? "#ffffffa8" : "#f3f8ffa8",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(144,202,249,0.3)";
                  e.currentTarget.style.transform = "scale(1.01)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    i % 2 === 0 ? "#ffffffa8" : "#f3f8ffa8";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <td style={td}>{p.entity}</td>
                <td style={td}>{p.pb_ratio}</td>
                <td style={td}>{p.roe}</td>
                <td style={td}>{p.gnpa_percent}</td>
                <td style={td}>{p.car}</td>
                <td style={td}>{p.market_cap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = {
  padding: "10px 8px",
  fontWeight: "600",
  borderBottom: "2px solid rgba(255,255,255,0.6)",
};

const td = {
  padding: "10px 8px",
  border: "none",
  borderRadius: "6px",
};
