// import React from "react";
// import {
//   LineChart, Line, BarChart, Bar,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend,
//   ResponsiveContainer
// } from "recharts";

// function PeerTrendChart({ data, metric }) {
//   if (!data || data.length === 0) return <p>No peer data available.</p>;

//   const firstRow = data[0];
//   const hasYear = "year" in firstRow;

//   return (
//     <div style={{ 
//       marginTop: "10px", 
//       border: "1px solid #ccc", 
//       padding: "15px", 
//       borderRadius: "8px",
//       background: "#f9f9f9",
//       boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//       width: "95%",
//       minHeight: "350px"
//     }}>
//       <h3 style={{ marginBottom: "15px", color: "#34495e" }}>Peer {metric.toUpperCase()} Trend</h3>
//       <div style={{ width: "100%", height: "300px" }}>
//         <ResponsiveContainer width="100%" height="100%">
//           {hasYear ? (
//             <LineChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//               <XAxis dataKey="year" tick={{ fontSize: 12 }} />
//               <YAxis tick={{ fontSize: 12 }} />
//               <Tooltip />
//               <Legend wrapperStyle={{ fontSize: "12px" }} />
//               {Object.keys(firstRow).filter(k => k !== "year").map((peer, i) => (
//                 <Line 
//                   key={peer} 
//                   type="monotone" 
//                   dataKey={peer} 
//                   stroke={["#3498db","#2ecc71","#e74c3c","#f1c40f"][i % 4]}
//                   strokeWidth={2} 
//                   dot={{ strokeWidth: 2 }}
//                 />
//               ))}
//             </LineChart>
//           ) : (
//             <BarChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//               <XAxis dataKey="entity" tick={{ fontSize: 12 }} />
//               <YAxis tick={{ fontSize: 12 }} />
//               <Tooltip />
//               <Legend wrapperStyle={{ fontSize: "12px" }} />
//               <Bar dataKey={metric} fill="#3498db" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           )}
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }

// export default PeerTrendChart;


import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function PeerTrendChart({ data, metric }) {
  if (!data || data.length === 0)
    return (
      <p
        style={{
          marginTop: "10px",
          textAlign: "center",
          color: "#6c757d",
          fontStyle: "italic",
        }}
      >
        No peer data available.
      </p>
    );

  const firstRow = data[0];
  const hasYear = "year" in firstRow;

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "24px",
        borderRadius: "20px",
        background:
          "linear-gradient(135deg, rgba(227,242,253,0.95), rgba(252,228,236,0.95))",
        boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
        backdropFilter: "blur(6px)",
        transition: "transform 0.2s ease, box-shadow 0.3s ease",
      }}
    >
      <h3
        style={{
          color: "#283593",
          textAlign: "center",
          marginBottom: "18px",
          fontSize: "18px",
          fontWeight: "700",
          letterSpacing: "0.4px",
          textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        Peer {metric.toUpperCase()} Trend
      </h3>

      <div style={{ width: "100%", height: "320px" }}>
        <ResponsiveContainer width="100%" height="100%">
          {hasYear ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12, fill: "#37474f" }}
                axisLine={{ stroke: "#ccc" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#37474f" }}
                axisLine={{ stroke: "#ccc" }}
              />
              <Tooltip
                contentStyle={{
                  background: "linear-gradient(135deg, #ffffff, #e3f2fd)",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  fontSize: "13px",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
                }}
                labelStyle={{ color: "#1a237e", fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: "13px" }} />

              {Object.keys(firstRow)
                .filter((k) => k !== "year")
                .map((peer, i) => (
                  <Line
                    key={peer}
                    type="monotone"
                    dataKey={peer}
                    stroke={[
                      "#42a5f5",
                      "#66bb6a",
                      "#ef5350",
                      "#ffb74d",
                      "#ab47bc",
                      "#26c6da",
                    ][i % 6]}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{
                      r: 6,
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                ))}
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
              <XAxis
                dataKey="entity"
                tick={{ fontSize: 12, fill: "#37474f" }}
                axisLine={{ stroke: "#ccc" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#37474f" }}
                axisLine={{ stroke: "#ccc" }}
              />
              <Tooltip
                contentStyle={{
                  background: "linear-gradient(135deg, #ffffff, #fce4ec)",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  fontSize: "13px",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
                }}
                labelStyle={{ color: "#1a237e", fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: "13px" }} />
              <Bar
                dataKey={metric}
                fill="#42a5f5"
                radius={[6, 6, 0, 0]}
                name={metric.toUpperCase()}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PeerTrendChart;
