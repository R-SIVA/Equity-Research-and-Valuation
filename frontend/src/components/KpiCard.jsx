import React from "react";

export default function KpiCard({title, value}){
  let color="#111";
  if(title==="GNPA" && value !== undefined && value > 5) color="red";
  if(title==="CAR" && value !== undefined && value < 12.5) color="red";
  if(title==="CASA" && value !== undefined && value > 40) color="green";

  return (
    <div style={{padding:12, borderRadius:8, background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.08)", textAlign:"center"}}>
      <div style={{fontSize:13, color:"#666"}}>{title}</div>
      <div style={{fontSize:18, fontWeight:700, color}}>{value !== undefined && value !== null ? (Number(value).toFixed(2) + "%") : "N/A"}</div>
    </div>
  )
}
