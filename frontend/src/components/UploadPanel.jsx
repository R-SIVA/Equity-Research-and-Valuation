// import React, {useState} from "react";
// import axios from "axios";

// export default function UploadPanel(){
//   const [file, setFile] = useState(null);
//   const [msg, setMsg] = useState("");

//   const upload = async () => {
//     if(!file) return setMsg("Select a file first");
//     const form = new FormData();
//     form.append("file", file);
//     try{
//       const res = await axios.post("http://127.0.0.1:8000/api/upload", form, {
//         headers: {"Content-Type": "multipart/form-data"}
//       });
//       setMsg(`Uploaded ${res.data.result.entity} rows=${res.data.result.rows}`);
//     }catch(err){
//       setMsg("Upload error: " + (err.response?.data?.detail || err.message));
//     }
//   }

//   return (
//     <div style={{marginTop:12, padding:12, border:"1px solid #ddd", borderRadius:8, background:"#fff"}}>
//       <div>
//         <label style={{marginRight:8}}>Upload Company Financials (xlsx/csv)</label>
//         <input type="file" accept=".xlsx,.xls,.csv" onChange={e=>setFile(e.target.files[0])} />
//         <button onClick={upload} style={{marginLeft:10, padding:"6px 10px"}}>Upload</button>
//       </div>
//       <div style={{marginTop:8}}>{msg}</div>
//       <div style={{marginTop:8, fontSize:13, color:"#555"}}>
//         Use the provided template columns. After upload the dashboard will compute ratios and train models automatically.
//       </div>
//     </div>
//   )
// }


import React, {useState} from "react";
import axios from "axios";

export default function UploadPanel(){
  const [companyFile, setCompanyFile] = useState(null);
  const [peerFile, setPeerFile] = useState(null);
  const [msg, setMsg] = useState("");

  const uploadCompany = async () => {
    if(!companyFile) return setMsg("Select company file first");
    const form = new FormData();
    form.append("file", companyFile);
    try{
      const res = await axios.post("http://127.0.0.1:8000/api/upload/company", form, {
        headers: {"Content-Type": "multipart/form-data"}
      });
      setMsg(`Company data uploaded: ${res.data.result.entity}`);
    }catch(err){
      setMsg("Upload error: " + (err.response?.data?.detail || err.message));
    }
  }

  const uploadPeers = async () => {
    if(!peerFile) return setMsg("Select peer file first");
    const form = new FormData();
    form.append("file", peerFile);
    try{
      const res = await axios.post("http://127.0.0.1:8000/api/upload/peers", form, {
        headers: {"Content-Type": "multipart/form-data"}
      });
      setMsg(`Peer data uploaded: rows=${res.data.result.rows}`);
    }catch(err){
      setMsg("Upload error: " + (err.response?.data?.detail || err.message));
    }
  }

  return (
    <div style={{marginTop:12, padding:12, border:"1px solid #ddd", borderRadius:8, background:"#fff"}}>
      <div>
        <label>Company Financials: </label>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={e=>setCompanyFile(e.target.files[0])} />
        <button onClick={uploadCompany} style={{marginLeft:8}}>Upload</button>
      </div>
      <div style={{marginTop:10}}>
        <label>Peer Comparison: </label>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={e=>setPeerFile(e.target.files[0])} />
        <button onClick={uploadPeers} style={{marginLeft:8}}>Upload</button>
      </div>
      <div style={{marginTop:8, fontSize:13, color:"#333"}}>{msg}</div>
    </div>
  )
}
