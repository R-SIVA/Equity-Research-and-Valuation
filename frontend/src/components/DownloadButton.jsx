import React from "react";
import { downloadDashboardReport } from "../utils/pdfReport"; // adjust import path

const DownloadButton = () => (
  <button
    onClick={() => downloadDashboardReport("dashboard-container")}
    style={{
      padding: "10px 16px",
      background: "linear-gradient(90deg, #4b6cb7, #182848)",
      color: "white",
      border: "none",
      borderRadius: 8,
      fontWeight: 600,
      cursor: "pointer",
      boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
      marginBottom: 20,
    }}
  >
    📥 Download PDF Report
  </button>
);

export default DownloadButton;
