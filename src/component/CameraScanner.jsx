import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const CameraScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const streamRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const lastResultTimeRef = useRef(0);
  const [showPreview, setShowPreview] = useState(false);

  // milliseconds to allow repeating same code
  const MIN_REPEAT_MS = 600;

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    let mounted = true;

    (async () => {
      try {
        // minta permission agar device label muncul dan kamera siap
        await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => {});
        const list = await navigator.mediaDevices.enumerateDevices();
        if (!mounted) return;
        const cams = list.filter((d) => d.kind === "videoinput");
        setDevices(cams);
        if (cams.length && !selectedDevice) setSelectedDevice(cams[0].deviceId);
      } catch (err) {
        console.error("enumerateDevices / getUserMedia error:", err);
      }
    })();

    return () => {
      mounted = false;
      try { readerRef.current?.reset(); } catch (e) {}
    };
  }, []); // run once

  useEffect(() => {
    // start/replace decoding whenever selectedDevice changes
    const reader = readerRef.current;
    const videoEl = videoRef.current;
    if (!reader || !selectedDevice) return;

    let active = true;

    const start = async () => {
      try {
        // stop previous
        try { reader.reset(); } catch (e) {}
        if (streamRef.current) {
          streamRef.current.getTracks()?.forEach((t) => t.stop());
          streamRef.current = null;
        }

        // open stream explicitly so permission is ensured and we can attach to video (even hidden)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDevice } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoEl) {
          videoEl.srcObject = stream;
          // keep video muted & inline to allow autoplay in renderer
          videoEl.muted = true;
          videoEl.playsInline = true;
          await videoEl.play().catch(() => {});
        }

        reader.decodeFromVideoDevice(selectedDevice, videoEl, (result, err) => {
          if (!active) return;
          if (result) {
            const text = result.getText();
            const now = Date.now();
            if (text && now - lastResultTimeRef.current > MIN_REPEAT_MS) {
              lastResultTimeRef.current = now;
              onScan && onScan(text);
            }
          }
        });
      } catch (err) {
        console.error("start camera error:", err);
      }
    };

    start();

    return () => {
      active = false;
      try { reader.reset(); } catch (e) {}
      if (streamRef.current) {
        streamRef.current.getTracks()?.forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [selectedDevice, onScan]);

  return (
    <div>
      <div className="mb-2">
        <label className="block text-sm text-gray-600 mb-1">Pilih kamera</label>
        <select
          className="border rounded px-2 py-1"
          value={selectedDevice || ""}
          onChange={(e) => setSelectedDevice(e.target.value)}
        >
          <option value="">Pilih kamera...</option>
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId}</option>
          ))}
        </select>
        <button
          className="ml-2 px-3 py-1 bg-gray-200 rounded"
          onClick={() => setShowPreview((v) => !v)}
        >
          {showPreview ? "Sembunyikan" : "Tampilkan"} pratinjau
        </button>
      </div>

      <div>
        {/* video tetap disertakan di DOM untuk memberikan frame ke decoder.
            Preview hanya di-toggle via CSS visibility sehingga decoding tetap jalan. */}
        <video
          ref={videoRef}
          className={`w-full max-w-xs h-auto border rounded ${showPreview ? "" : "hidden"}`}
        />
        <div className="text-xs text-gray-500 mt-2">
          Izin kamera dibutuhkan. DroidCam muncul sebagai device bila aktif di PC.
        </div>
      </div>
    </div>
  );
};

export default CameraScanner;