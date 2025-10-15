import React from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

function PeerTrendChart({ data, metric }) {
  if (!data || data.length === 0) return <p>No peer data available.</p>;

  const firstRow = data[0];
  const hasYear = "year" in firstRow;

  return (
    <div style={{ marginTop: "30px", border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
      <h3 style={{ marginBottom: "10px" }}>Peer {metric.toUpperCase()} Trend</h3>
      {hasYear ? (
        <LineChart width={700} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          {Object.keys(firstRow).filter(k => k !== "year").map((peer, i) => (
            <Line key={peer} type="monotone" dataKey={peer} stroke={["#8884d8","#82ca9d","#ff7300","#0088FE"][i % 4]} />
          ))}
        </LineChart>
      ) : (
        <BarChart width={700} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="entity" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={metric} fill="#82ca9d" />
        </BarChart>
      )}
    </div>
  );
}

export default PeerTrendChart;
