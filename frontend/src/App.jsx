import React from "react";
import UploadPanel from "./components/UploadPanel";
import Dashboard from "./components/Dashboard";

export default function App(){
  return (
    <div style={{padding:20}}>
      <h1 style={{fontSize:45, fontWeight:700}}>Dashboard</h1>
      <UploadPanel />
      <Dashboard />
    </div>
  )
}
