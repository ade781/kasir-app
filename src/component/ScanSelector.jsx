import React, { useState } from "react";
import ScannerInput from "./ScannerInput";
import CameraScanner from "./CameraScanner";

const ScanSelector = ({ onScan }) => {
  const [mode, setMode] = useState("scanner");
  const [lastScan, setLastScan] = useState("");

  const handleScan = (data) => {
    setLastScan(String(data));
    if (typeof onScan === "function") onScan(String(data));
  };

  return (
    <div className="p-2 bg-white rounded shadow">
      <div className="flex gap-2 items-center mb-2">
        <button onClick={() => setMode("scanner")} className={`px-3 py-1 rounded ${mode==="scanner"?"bg-blue-600 text-white":"bg-gray-100"}`}>Scanner</button>
        <button onClick={() => setMode("camera")} className={`px-3 py-1 rounded ${mode==="camera"?"bg-blue-600 text-white":"bg-gray-100"}`}>Camera</button>
        <div className="ml-auto text-sm text-gray-600">Last: {lastScan || "-"}</div>
      </div>

      <div>
        {mode === "scanner" ? (
          <ScannerInput onScan={handleScan} />
        ) : (
          <CameraScanner onScan={handleScan} />
        )}
      </div>
    </div>
  );
};

export default ScanSelector;
