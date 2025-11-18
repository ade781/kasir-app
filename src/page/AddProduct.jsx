import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../stores/useToast";
// Import component CameraScanner
import CameraScanner from "../component/CameraScanner";

const AddProduct = () => {
    const navigate = useNavigate();
    const toast = useToast();

    // State untuk mengontrol tampilan kamera
    const [showCamera, setShowCamera] = useState(false);

    const [form, setForm] = useState({
        barcode: '',
        name: '',
        price: '',
        stock: ''
    });

    // Fungsi callback saat barcode ter-scan
    const handleScan = (code) => {
        if (code) {
            setForm((prev) => ({ ...prev, barcode: code }));
            // Opsional: Berikan feedback kecil atau tutup kamera otomatis jika diinginkan
            // setShowCamera(false); 
        }
    };

    const addProduct = async (e) => {
        if (e) e.preventDefault();
        // simple validation
        if (!form.name.trim()) return alert('Nama wajib');
        const payload = {
            barcode: form.barcode.trim() || null,
            name: form.name.trim(),
            price: Number(form.price) || 0,
            stock: Number(form.stock) || 0
        };

        try {
            await window.api.products.add(payload);
            toast.push({ type: "success", title: "Berhasil", message: "Produk ditambahkan" });
            navigate('/list');
        } catch (err) {
            console.error(err);
            toast.push({ type: "error", title: "Gagal", message: err.message || "Gagal menambah produk" });
        }
    };

    return (
        <div className="p-4">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 text-blue-600 hover:underline"
            > &larr; Kembali </button>

            <h1 className="text-xl font-bold mb-2">Tambah Produk</h1>

            <form onSubmit={addProduct} className="mb-4 grid gap-2" style={{ maxWidth: 480 }}>

                {/* Bagian Kamera Scanner */}
                <div className="border p-2 rounded bg-gray-50 mb-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Scan Barcode?</span>
                        <button
                            type="button"
                            onClick={() => setShowCamera(!showCamera)}
                            className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                        >
                            {showCamera ? "Tutup Kamera" : "Buka Kamera"}
                        </button>
                    </div>

                    {showCamera && (
                        <div className="mb-2">
                            <CameraScanner onScan={handleScan} />
                        </div>
                    )}
                </div>

                <input
                    placeholder="Barcode (opsional)"
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    className="border p-2 rounded"
                />
                <input
                    placeholder="Nama produk *"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="border p-2 rounded"
                    required
                />
                <input
                    placeholder="Harga (angka)"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="border p-2 rounded"
                    inputMode="numeric"
                />
                <input
                    placeholder="Stok (angka)"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="border p-2 rounded"
                    inputMode="numeric"
                />
                <div>
                    <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded mr-2">Tambah</button>
                </div>
            </form>
        </div>
    );
}

export default AddProduct;