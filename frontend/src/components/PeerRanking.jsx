// import React, { useEffect, useState } from "react";
// import axios from "axios";

// function PeerRanking({ metric, higherIsBetter }) {
//   const [ranks, setRanks] = useState([]);

//   useEffect(() => {
//     axios.get(`http://127.0.0.1:8000/api/peers/rank?metric=${metric}&higher_is_better=${higherIsBetter}`)
//       .then(res => setRanks(res.data))
//       .catch(err => console.error(err));
//   }, [metric, higherIsBetter]);

//   return (
//     <div style={{ marginTop: 20, padding: 20, border: "1px solid #ddd", borderRadius: 8, background: "#f9f9f9", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
//       <h3 style={{ color: "#333", marginBottom: 16 }}>{metric.toUpperCase()} Rankings</h3>
//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr style={{ background: "#f5f5f5" }}>
//             <th style={{ padding: 8, border: "1px solid #ddd" }}>Rank</th>
//             <th style={{ padding: 8, border: "1px solid #ddd" }}>Entity</th>
//             <th style={{ padding: 8, border: "1px solid #ddd" }}>{metric.toUpperCase()}</th>
//           </tr>
//         </thead>
//         <tbody>
//           {ranks.map((row, i) => (
//             <tr key={i}>
//               <td style={{ padding: 8, border: "1px solid #ddd" }}>{row.rank}</td>
//               <td style={{ padding: 8, border: "1px solid #ddd" }}>{row.entity}</td>
//               <td style={{ padding: 8, border: "1px solid #ddd" }}>{row[metric]}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default PeerRanking;


import React, { useEffect, useState } from "react";
import axios from "axios";

function PeerRanking({ metric, higherIsBetter }) {
  const [ranks, setRanks] = useState([]);

  useEffect(() => {
    axios
      .get(
        `http://127.0.0.1:8000/api/peers/rank?metric=${metric}&higher_is_better=${higherIsBetter}`
      )
      .then((res) => setRanks(res.data))
      .catch((err) => console.error(err));
  }, [metric, higherIsBetter]);

  if (!ranks.length)
    return (
      <div
        style={{
          marginTop: 20,
          textAlign: "center",
          color: "#6c757d",
          fontStyle: "italic",
        }}
      >
        No ranking data available.
      </div>
    );

  return (
    <div
      style={{
        marginTop: 24,
        padding: 24,
        borderRadius: 20,
        background:
          "linear-gradient(135deg, rgba(232,245,233,0.95), rgba(227,242,253,0.95))",
        boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
        backdropFilter: "blur(6px)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <h3
        style={{
          color: "#1a237e",
          marginBottom: 18,
          fontSize: 18,
          fontWeight: 700,
          textAlign: "center",
          textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        🏅 {metric.toUpperCase()} Rankings
      </h3>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <thead>
          <tr
            style={{
              background: "linear-gradient(90deg, #64b5f6, #ba68c8)",
              color: "#fff",
              textAlign: "left",
            }}
          >
            <th style={thStyle}>Rank</th>
            <th style={thStyle}>Entity</th>
            <th style={thStyle}>{metric.toUpperCase()}</th>
          </tr>
        </thead>
        <tbody>
          {ranks.map((row, i) => (
            <tr
              key={i}
              style={{
                background: i % 2 === 0 ? "#f8f9fa" : "#f1f8e9",
                transition: "background 0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#e3f2fd")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background =
                  i % 2 === 0 ? "#f8f9fa" : "#f1f8e9")
              }
            >
              <td style={tdStyle}>{row.rank}</td>
              <td style={tdStyle}>{row.entity}</td>
              <td
                style={{
                  ...tdStyle,
                  fontWeight: 600,
                  color: higherIsBetter
                    ? "#2e7d32"
                    : "#c62828",
                }}
              >
                {row[metric]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: "10px 12px",
  fontWeight: 600,
  fontSize: 13,
  borderBottom: "2px solid rgba(255,255,255,0.3)",
};

const tdStyle = {
  padding: "10px 12px",
  fontSize: 14,
  color: "#37474f",
  borderBottom: "1px solid #ddd",
};

export default PeerRanking;
