// import React from "react";

// export default function KpiCard({title, value}){
//   let color="#111";
//   if(title==="GNPA" && value !== undefined && value > 5) color="red";
//   if(title==="CAR" && value !== undefined && value < 12.5) color="red";
//   if(title==="CASA" && value !== undefined && value > 40) color="green";

//   return (
//     <div style={{padding:20, borderRadius:8, background:"#f8c5ffff", boxShadow:"0 4px 8px rgba(0,0,0,0.1)", textAlign:"center"}}>
//       <div style={{fontSize:14, color:"#666", marginBottom:8}}>{title}</div>
//       <div style={{fontSize:20, fontWeight:700, color}}>{value !== undefined && value !== null ? (Number(value).toFixed(2) + "%") : "N/A"}</div>
//     </div>
//   )
// }



import React from "react";
import { motion } from "framer-motion";

export default function KpiCard({ title, value }) {
  // Default color theme
  let bg = "linear-gradient(135deg, #f0f0f0, #dcdcdc)";
  let textColor = "#111";

  if (value !== undefined && value !== null) {
    switch (title) {
      case "NIM":
        bg = value > 4 ? "linear-gradient(135deg, #a8e063, #56ab2f)" : "linear-gradient(135deg, #ffe259, #ffa751)";
        textColor = "#fff";
        break;
      case "GNPA":
        bg = value > 5
          ? "linear-gradient(135deg, #ff4e50, #f9d423)"
          : "linear-gradient(135deg, #56ab2f, #a8e063)";
        textColor = "#fff";
        break;
      case "CASA":
        bg = value > 40
          ? "linear-gradient(135deg, #43cea2, #185a9d)"
          : "linear-gradient(135deg, #ffb347, #ffcc33)";
        textColor = "#fff";
        break;
      case "CAR":
        bg = value < 12.5
          ? "linear-gradient(135deg, #ff4e50, #f9d423)"
          : "linear-gradient(135deg, #36d1dc, #5b86e5)";
        textColor = "#fff";
        break;
      default:
        bg = "linear-gradient(135deg, #f0f0f0, #dcdcdc)";
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      style={{
        padding: 20,
        borderRadius: 16,
        background: bg,
        boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
        textAlign: "center",
        color: textColor,
        transition: "0.3s",
      }}
    >
      <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 800 }}>
        {value !== undefined && value !== null ? `${Number(value).toFixed(2)}%` : "N/A"}
      </div>
    </motion.div>
  );
}
