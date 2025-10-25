// // import React, {useState} from "react";
// // import axios from "axios";

// // export default function UploadPanel(){
// //   const [file, setFile] = useState(null);
// //   const [msg, setMsg] = useState("");

// //   const upload = async () => {
// //     if(!file) return setMsg("Select a file first");
// //     const form = new FormData();
// //     form.append("file", file);
// //     try{
// //       const res = await axios.post("http://127.0.0.1:8000/api/upload", form, {
// //         headers: {"Content-Type": "multipart/form-data"}
// //       });
// //       setMsg(`Uploaded ${res.data.result.entity} rows=${res.data.result.rows}`);
// //     }catch(err){
// //       setMsg("Upload error: " + (err.response?.data?.detail || err.message));
// //     }
// //   }

// //   return (
// //     <div style={{marginTop:12, padding:12, border:"1px solid #ddd", borderRadius:8, background:"#fff"}}>
// //       <div>
// //         <label style={{marginRight:8}}>Upload Company Financials (xlsx/csv)</label>
// //         <input type="file" accept=".xlsx,.xls,.csv" onChange={e=>setFile(e.target.files[0])} />
// //         <button onClick={upload} style={{marginLeft:10, padding:"6px 10px"}}>Upload</button>
// //       </div>
// //       <div style={{marginTop:8}}>{msg}</div>
// //       <div style={{marginTop:8, fontSize:13, color:"#555"}}>
// //         Use the provided template columns. After upload the dashboard will compute ratios and train models automatically.
// //       </div>
// //     </div>
// //   )
// // }


// import React, {useState} from "react";
// import axios from "axios";

// export default function UploadPanel(){
//   const [companyFile, setCompanyFile] = useState(null);
//   const [peerFile, setPeerFile] = useState(null);
//   const [msg, setMsg] = useState("");

//   const validateFile = (file) => {
//     const allowedExtensions = [".xlsx", ".xls", ".csv"];
//     const fileExtension = file.name.split(".").pop().toLowerCase();
//     return allowedExtensions.includes(`.${fileExtension}`);
//   };

//   const uploadCompany = async () => {
//     if(!companyFile) return setMsg("Select company file first");
//     if(!validateFile(companyFile)) return setMsg("Invalid file type. Use .xlsx, .xls, or .csv");
//     const form = new FormData();
//     form.append("file", companyFile);
//     try{
//       const res = await axios.post("http://127.0.0.1:8000/api/upload/company", form, {
//         headers: {"Content-Type": "multipart/form-data"}
//       });
//       setMsg(`Company data uploaded: ${res.data.result.entity}`);
//     }catch(err){
//       setMsg("Upload error: " + (err.response?.data?.detail || err.message));
//     }
//   };

//   const uploadPeers = async () => {
//     if(!peerFile) return setMsg("Select peer file first");
//     if(!validateFile(peerFile)) return setMsg("Invalid file type. Use .xlsx, .xls, or .csv");
//     const form = new FormData();
//     form.append("file", peerFile);
//     try{
//       const res = await axios.post("http://127.0.0.1:8000/api/upload/peers", form, {
//         headers: {"Content-Type": "multipart/form-data"}
//       });
//       setMsg(`Peer data uploaded: rows=${res.data.result.rows}`);
//     }catch(err){
//       setMsg("Upload error: " + (err.response?.data?.detail || err.message));
//     }
//   };

//   return (
//     <div style={{marginTop:12, width:"50%", padding:20, border:"1px solid #ddd", borderRadius:8, background:"#f9f9f9", boxShadow:"0 4px 8px rgba(0,0,0,0.1)"}}>
//       <h2 style={{color:"#333", marginBottom:16}}>Upload Data</h2>
//       <div style={{marginBottom:20}}>
//         <label style={{fontWeight:600, marginRight:8}}>Company Financials: </label>
//         <input type="file" accept=".xlsx,.xls,.csv" onChange={e=>setCompanyFile(e.target.files[0])} style={{padding:8, borderRadius:4, border:"1px solid #ccc"}} />
//         <button onClick={uploadCompany} style={{marginLeft:8, padding:"8px 16px", background:"#4CAF50", color:"white", border:"none", borderRadius:4, cursor:"pointer"}}>Upload</button>
//       </div>
//       <div style={{marginBottom:20}}>
//         <label style={{fontWeight:600, marginRight:8}}>Peer Comparison: </label>
//         <input type="file" accept=".xlsx,.xls,.csv" onChange={e=>setPeerFile(e.target.files[0])} style={{padding:8, borderRadius:4, border:"1px solid #ccc"}} />
//         <button onClick={uploadPeers} style={{marginLeft:8, padding:"8px 16px", background:"#4CAF50", color:"white", border:"none", borderRadius:4, cursor:"pointer"}}>Upload</button>
//       </div>
//       <div style={{marginTop:8, fontSize:14, color:"#555"}}>{msg}</div>
//     </div>
//   );
// }


import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UploadPanel() {
  const [companyFile, setCompanyFile] = useState(null);
  const [peerFile, setPeerFile] = useState(null);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const validateFile = (file) => {
    const allowedExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    return allowedExtensions.includes(`.${fileExtension}`);
  };

  const uploadpage=()=>{
 navigate("/");
  }

  const uploadCompany = async () => {
    if (!companyFile) return setMsg("Select company file first");
    if (!validateFile(companyFile)) return setMsg("Invalid file type. Use .xlsx, .xls, or .csv");
    const form = new FormData();
    form.append("file", companyFile);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/upload/company", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg(`✅ Company data uploaded: ${res.data.result.entity}`);
    } catch (err) {
      setMsg("❌ Upload error: " + (err.response?.data?.detail || err.message));
    }
  };

  const uploadPeers = async () => {
    if (!peerFile) return setMsg("Select peer file first");
    if (!validateFile(peerFile)) return setMsg("Invalid file type. Use .xlsx, .xls, or .csv");
    const form = new FormData();
    form.append("file", peerFile);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/upload/peers", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg(`✅ Peer data uploaded: rows = ${res.data.result.rows}`);
    } catch (err) {
      setMsg("❌ Upload error: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div style={{
        padding: 32,
        background: "linear-gradient(135deg, #e3f2fd, #fce4ec)",
        borderRadius: 20,
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
      }}>
        <button
              onClick={uploadpage}
              style={{
                marginleft: 16,
                float:"right",
                padding: "10px 18px",
                background: "linear-gradient(90deg, #ec9595ff, #ff3030ff)",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                transition: "0.3s",
              }}
              onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseOut={e => e.currentTarget.style.transform = "scale(1.0)"}
            >
              Dashboard
            </button>
    <div
      style={{
        margin: "30px auto",
        width: "70%",
        // height:"90vh",
        padding: 30,
        borderRadius: 16,
        background: "linear-gradient(135deg, #74ebd5, #ACB6E5)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        transition: "0.3s",
      }}
    >
      <h2 style={{ color: "#fff", textAlign: "center", marginBottom: 24, fontSize: 28 }}>
        📊 Upload Financial Data
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          background: "rgba(255,255,255,0.2)",
          padding: 20,
          borderRadius: 12,
        }}
      >
        {/* Company Upload */}
        <div
          style={{
            background: "rgba(255,255,255,0.85)",
            padding: 16,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            // height:"100vh"
          }}
        >
          <div>
            <label style={{ fontWeight: 700, color: "#2c3e50" }}>🏦 Company Financials</label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setCompanyFile(e.target.files[0])}
              style={{
                marginLeft: 10,
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc",
                background: "#fff",
              }}
            />
          </div>
          <button
            onClick={uploadCompany}
            style={{
              background: "linear-gradient(90deg, #36D1DC, #5B86E5)",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
            }}
          >
            Upload
          </button>
        </div>

        {/* Peer Upload */}
        <div
          style={{
            background: "rgba(255,255,255,0.85)",
            padding: 16,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div>
            <label style={{ fontWeight: 700, color: "#2c3e50" }}>🤝 Peer Comparison</label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setPeerFile(e.target.files[0])}
              style={{
                marginLeft: 10,
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc",
                background: "#fff",
              }}
            />
          </div>
          <button
            onClick={uploadPeers}
            style={{
              background: "linear-gradient(90deg, #43cea2, #185a9d)",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
            }}
          >
            Upload
          </button>
        </div>
      </div>

      {/* Message Display */}
      <div
        style={{
          marginTop: 20,
          textAlign: "center",
          fontSize: 16,
          fontWeight: 600,
          color: msg.startsWith("✅") ? "#1B5E20" : "#B71C1C",
          background: "rgba(255,255,255,0.8)",
          borderRadius: 8,
          padding: 10,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {msg}
      </div>
    </div>
    
    </div>
  );
}
