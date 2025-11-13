import { useState } from "react";
import ScannerInput from "./ScannerInput";
import CameraScanner from "./CameraScanner";

const ScanSelector = () => {
  const [mode, setMode] = useState("scanner");
  const [lastScan, setLastScan] = useState("");

  const handleScan = (data) => {
    setLastScan(data);
    console.log("Hasil scan:", data);
    // bisa lanjut ke query SQLite atau lookup produk
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode("scanner")} className="btn">Mode Scanner</button>
        <button onClick={() => setMode("camera")} className="btn">Mode Kamera</button>
      </div>

      {mode === "scanner" ? (
        <ScannerInput onScan={handleScan} />
      ) : (
        <CameraScanner onScan={handleScan} />
      )}

      <div className="mt-4 text-sm text-gray-600">
        Hasil: <span className="font-semibold">{lastScan}</span>
      </div>
    </div>
  );
}

export default ScanSelector;