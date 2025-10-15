import React, {useEffect, useState} from "react";
import axios from "axios";

export default function PeerTable(){
  const [peers, setPeers] = useState([]);

  useEffect(()=>{
    async function load(){
      try{
        const res = await axios.get("http://127.0.0.1:8000/api/peers");
        setPeers(res.data);
      }catch(e){ console.error(e); }
    }
    load();
  },[]);

  if(!peers.length) return <div style={{marginTop:10}}>No peer data uploaded.</div>

  return (
    <div style={{marginTop:20, background:"#fff", padding:12, borderRadius:8, border:"1px solid #eee"}}>
      <h3>Peer Comparison</h3>
      <table style={{borderCollapse:"collapse", width:"100%", marginTop:10}}>
        <thead>
          <tr style={{background:"#f6f6f6"}}>
            <th style={th}>Entity</th>
            <th style={th}>P/B</th>
            <th style={th}>ROE</th>
            <th style={th}>GNPA%</th>
            <th style={th}>CAR%</th>
            <th style={th}>Market Cap</th>
          </tr>
        </thead>
        <tbody>
          {peers.map((p,i)=>(
            <tr key={i}>
              <td style={td}>{p.entity}</td>
              <td style={td}>{p.pb_ratio}</td>
              <td style={td}>{p.roe}</td>
              <td style={td}>{p.gnpa_percent}</td>
              <td style={td}>{p.car}</td>
              <td style={td}>{p.market_cap}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const th = {border:"1px solid #ccc", padding:"6px", fontWeight:"bold", fontSize:13};
const td = {border:"1px solid #ccc", padding:"6px", fontSize:13};
