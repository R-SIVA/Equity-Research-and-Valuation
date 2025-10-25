// import React from "react";
// import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

// export default function TrendChart({data, metric, title, forecast=[]}){
//   const formatted = (data || []).map(r=>({period: r.period_end?.split("T")[0] || r.period_end, value: r[metric]}));
//   // append forecast if provided: forecast is array of {period_end,yhat,yhat_lower,yhat_upper}
//   const fcFmt = (forecast || []).map(f=>({period: f.period_end, yhat: f.yhat, yhat_lower: f.yhat_lower, yhat_upper: f.yhat_upper}));
//   // merge last historical date to align x-axis
//   const combined = [...formatted];
//   fcFmt.forEach(f => combined.push({period: f.period, value: f.yhat, yhat_lower: f.yhat_lower, yhat_upper: f.yhat_upper}));

//   return (
//     <div style={{padding:20, borderRadius:8, background:"#fffeeaff", boxShadow:"0 4px 8px rgba(0,0,0,0.1)"}}>
//       <h3 style={{color:"#333", marginBottom:16}}>{title}</h3>
//       <div style={{height:220}}>
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={combined}>
//             <XAxis dataKey="period" tick={{fontSize:11}} />
//             <YAxis />
//             <Tooltip />
//             <CartesianGrid stroke="#f0f0f0" />
//             <Line type="monotone" dataKey="value" stroke="#1976d2" dot={false} />
//             <Line type="monotone" dataKey="yhat" stroke="#ff7f0e" dot={false} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   )
// }

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function TrendChart({ data, metric, title, forecast = [] }) {
  const formatted = (data || []).map((r) => ({
    period: r.period_end?.split("T")[0] || r.period_end,
    value: r[metric],
  }));

  const fcFmt = (forecast || []).map((f) => ({
    period: f.period_end,
    yhat: f.yhat,
    yhat_lower: f.yhat_lower,
    yhat_upper: f.yhat_upper,
  }));

  const combined = [...formatted];
  fcFmt.forEach((f) =>
    combined.push({
      period: f.period,
      value: f.yhat,
      yhat_lower: f.yhat_lower,
      yhat_upper: f.yhat_upper,
    })
  );

  return (
    <div
      style={{
        padding: 24,
        borderRadius: 20,
        background:
          "linear-gradient(135deg, rgba(227, 242, 253, 0.9), rgba(252, 228, 236, 0.9))",
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
        {title}
      </h3>

      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combined}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 11, fill: "#37474f" }}
              axisLine={{ stroke: "#ccc" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#37474f" }}
              axisLine={{ stroke: "#ccc" }}
            />
            <Tooltip
              contentStyle={{
                background: "linear-gradient(135deg, #ffffff, #e3f2fd)",
                border: "1px solid #ddd",
                borderRadius: 10,
                fontSize: 13,
                boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
              }}
              labelStyle={{ color: "#1a237e", fontWeight: 600 }}
            />

            {/* Historical Data Line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#42a5f5"
              strokeWidth={2.5}
              dot={{ stroke: "#1e88e5", fill: "#90caf9", r: 3 }}
              activeDot={{ r: 6, fill: "#1e88e5", stroke: "#fff", strokeWidth: 2 }}
              name="Historical"
            />

            {/* Forecast Line */}
            <Line
              type="monotone"
              dataKey="yhat"
              stroke="#ef5350"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              name="Forecast"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
