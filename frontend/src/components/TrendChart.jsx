import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Area } from "recharts";

export default function TrendChart({data, metric, title, forecast=[]}){
  const formatted = (data || []).map(r=>({period: r.period_end?.split("T")[0] || r.period_end, value: r[metric]}));
  // append forecast if provided: forecast is array of {period_end,yhat,yhat_lower,yhat_upper}
  const fcFmt = (forecast || []).map(f=>({period: f.period_end, yhat: f.yhat, yhat_lower: f.yhat_lower, yhat_upper: f.yhat_upper}));
  // merge last historical date to align x-axis
  const combined = [...formatted];
  fcFmt.forEach(f => combined.push({period: f.period, value: f.yhat, yhat_lower: f.yhat_lower, yhat_upper: f.yhat_upper}));

  return (
    <div style={{padding:12, borderRadius:8, background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
      <div style={{fontSize:14, fontWeight:700, marginBottom:6}}>{title}</div>
      <div style={{height:220}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combined}>
            <XAxis dataKey="period" tick={{fontSize:11}} />
            <YAxis />
            <Tooltip />
            <CartesianGrid stroke="#f0f0f0" />
            <Line type="monotone" dataKey="value" stroke="#1976d2" dot={false} />
            <Line type="monotone" dataKey="yhat" stroke="#ff7f0e" dot={false} />
            {/* If you want to show area for confidence, could use Area with y0/y1 */}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
