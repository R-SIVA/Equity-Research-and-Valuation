import React from "react";
import UploadPanel from "./components/UploadPanel";
import Dashboard from "./components/Dashboard";
 import { Routes, Route,BrowserRouter } from 'react-router-dom';

export default function App(){
  return (
    <BrowserRouter >
          <Routes>
            <Route path="/upload" element={ <UploadPanel />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
  )
}
