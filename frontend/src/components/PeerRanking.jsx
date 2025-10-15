import React, { useEffect, useState } from "react";
import axios from "axios";

function PeerRanking({ metric, higherIsBetter }) {
  const [ranks, setRanks] = useState([]);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/peers/rank?metric=${metric}&higher_is_better=${higherIsBetter}`)
      .then(res => setRanks(res.data))
      .catch(err => console.error(err));
  }, [metric, higherIsBetter]);

  return (
    <div style={{ marginTop: "20px", border: "1px solid #eee", padding: "10px" }}>
      <h3>{metric.toUpperCase()} Rankings</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Rank</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Entity</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>{metric.toUpperCase()}</th>
          </tr>
        </thead>
        <tbody>
          {ranks.map((row, i) => (
            <tr key={i}>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.rank}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.entity}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row[metric]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PeerRanking;
