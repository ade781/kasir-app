import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../stores/useToast";
import ScanSelector from "../component/ScanSelector";

// Simple Transaksi page
// Features:
// - Add product via modal search (by name or barcode)
// - Qty +/- and editable quantity per row (real-time)
// - Remove row (x)
// - Subtotal and Total display
// - Checkout (calls ipc) and shows toast

const Transaksi = () => {
    const navigate = useNavigate();
    const toast = useToast((s) => s.push);

    const [allProducts, setAllProducts] = useState([]); // local cache for search
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [paid, setPaid] = useState("0");

    // cart items: { id, barcode, name, price, qty }
    const [cart, setCart] = useState([]);

    // modal state
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [search, setSearch] = useState("");
    const searchRef = useRef(null);

    // load all products once for client-side search
    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoadingProducts(true);
            try {
                const res = await window.api.products.list();
                if (!mounted) return;
                setAllProducts(res || []);
            } catch (err) {
                console.error("Failed load products", err);
                toast({ type: "error", title: "Error", message: err?.message || "Gagal memuat produk" });
            } finally {
                if (mounted) setLoadingProducts(false);
            }
        })();
        return () => (mounted = false);
    }, []);

    // filtered search results by name or barcode
    const filtered = useMemo(() => {
        const q = (search || "").toString().trim().toLowerCase();
        if (!q) return allProducts;
        return allProducts.filter((p) => {
            return (p.name || "").toString().toLowerCase().includes(q) || (p.barcode || "").toString().toLowerCase().includes(q);
        });
    }, [allProducts, search]);

    const openAddModal = () => {
        setSearch("");
        setShowModal(true);
        // focus next tick
        setTimeout(() => searchRef.current?.focus(), 50);
    };

    const openConfirmModal = () => {
        if (!cart.length) return toast({ type: "info", title: "Keranjang kosong", message: "Tambahkan produk sebelum checkout" });
        if (Number(paid) < total) return toast({ type: "error", title: "Pembayaran tidak cukup", message: "Jumlah pembayaran kurang dari total" });
        setShowConfirm(true);
    };
    const closeConfirmModal = () => setShowConfirm(false);

    const closeModal = () => setShowModal(false);

    const addToCart = (product) => {
        setCart((c) => {
            const idx = c.findIndex((x) => x.id === product.id);
            if (idx >= 0) {
                const copy = [...c];
                copy[idx] = { ...copy[idx], qty: Number(copy[idx].qty || 0) + 1 };
                return copy;
            }
            return [...c, { id: product.id, barcode: product.barcode, name: product.name, price: Number(product.price || 0), qty: 1 }];
        });
        toast({ type: "success", title: "Ditambahkan", message: `${product.name} ditambahkan ke keranjang` });
    };

    // handler untuk menerima kode dari scanner/camera
    const handleScannedCode = async (code) => {
        if (!code) return;
        try {
            const prod = await window.api.products.byBarcode(String(code).trim());
            if (!prod) {
                toast({ type: "error", title: "Tidak ditemukan", message: `Kode ${code} tidak ditemukan` });
                return;
            }
            // pakai addToCart yang sudah ada
            addToCart(prod);
        } catch (err) {
            console.error("scan error:", err);
            toast({ type: "error", title: "Error", message: err?.message || "Gagal memproses scan" });
        }
    };

    const removeFromCart = (id) => setCart((c) => c.filter((x) => x.id !== id));

    const changeQty = (id, next) => {
        setCart((c) => c.map((it) => (it.id === id ? { ...it, qty: Math.max(0, Number(next) || 0) } : it)));
    };

    const increment = (id) => {
        setCart((c) => c.map((it) => (it.id === id ? { ...it, qty: Number(it.qty || 0) + 1 } : it)));
    };

    const decrement = (id) => {
        setCart((c) => c.map((it) => (it.id === id ? { ...it, qty: Math.max(0, Number(it.qty || 0) - 1) } : it)));
    };

    const subtotal = useMemo(() => cart.reduce((s, it) => s + (Number(it.price || 0) * Number(it.qty || 0)), 0), [cart]);
    const total = subtotal; // placeholder: no tax/discount

    const onCheckout = async () => {
        // build sale payload
        const items = cart.map((it) => ({ id: it.id, price: it.price, qty: it.qty }));
        const sale = {
            items,
            subtotal,
            total,
            paid: Number(paid) || 0,
            change: paid - total,
        };
        try {
            const id = await window.api.sales.checkout(sale);
            toast({ type: "success", title: "Sukses", message: `Checkout berhasil (id: ${id})` });
            setCart([]);
        } catch (err) {
            console.error("Checkout failed", err);
            toast({ type: "error", title: "Gagal", message: err?.message || "Checkout gagal" });
        }
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">Transaksi</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="px-3 py-1 rounded bg-gray-200">Kembali</button>
                    <button onClick={openAddModal} className="px-3 py-1 rounded bg-blue-600 text-white">Tambah Barang</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white shadow rounded p-3">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="text-left text-sm text-gray-600">
                                <th className="px-2 py-2">Nama</th>
                                <th className="px-2 py-2">Harga</th>
                                <th className="px-2 py-2">Qty</th>
                                <th className="px-2 py-2">Total</th>
                                <th className="px-2 py-2">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-2 py-6 text-center text-gray-500">Keranjang kosong — klik "Tambah Barang"</td>
                                </tr>
                            ) : (
                                cart.map((it) => (
                                    <tr key={it.id} className="border-t">
                                        <td className="px-2 py-2">{it.name}</td>
                                        <td className="px-2 py-2">Rp{Number(it.price).toLocaleString("id-ID")}</td>
                                        <td className="px-2 py-2">
                                            <div className="inline-flex items-center border rounded overflow-hidden">
                                                <button onClick={() => decrement(it.id)} className="px-2 bg-gray-100">-</button>
                                                <input
                                                    value={it.qty}
                                                    onChange={(e) => changeQty(it.id, e.target.value)}
                                                    className="w-12 text-center px-1"
                                                />
                                                <button onClick={() => increment(it.id)} className="px-2 bg-gray-100">+</button>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">Rp{Number(it.price * it.qty).toLocaleString("id-ID")}</td>
                                        <td className="px-2 py-2">
                                            <button onClick={() => removeFromCart(it.id)} className="text-red-600">✕</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white shadow rounded p-3">
                    <ScanSelector onScan={handleScannedCode} />
                    <div className="mb-4">
                        <div className="text-sm text-gray-500">Subtotal</div>
                        <div className="text-xl font-semibold">Rp{subtotal.toLocaleString("id-ID")}</div>
                    </div>
                    <div className="mb-4">
                        <div className="text-sm text-gray-500">Total</div>
                        <div className="text-xl font-bold">Rp{total.toLocaleString("id-ID")}</div>
                    </div>
                    <div className="mb-4">
                        <div className="text-sm text-gray-500">Dibayar</div>
                        <input className="border rounded px-2 py-1 w-full" type="number" value={paid} onChange={(e) => setPaid(e.target.value)} required min={0} />
                        <div className="text-xl font-semibold">Rp{Number(paid).toLocaleString("id-ID")}</div>
                    </div>
                    <div className="mb-4">
                        <div className="text-sm text-gray-500">Kembalian</div>
                        <div className="text-xl font-semibold">Rp{Number(paid) - total >= 0 ? (Number(paid) - total).toLocaleString("id-ID") : 0}</div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={openConfirmModal} className="flex-1 bg-green-600 text-white px-3 py-2 rounded">Checkout</button>
                        <button onClick={() => { setCart([]); setPaid("0"); }} className="flex-1 bg-gray-200 px-3 py-2 rounded">Kosongkan</button>
                    </div>
                </div>
            </div>

            {/* Modal: confirm checkout */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={closeConfirmModal}></div>
                    <div className="relative bg-white rounded shadow-lg w-full max-w-md mx-4 p-4">
                        <h2 className="text-xl font-semibold mb-4">Konfirmasi Checkout</h2>
                        <h3 className="text-lg font-semibold">Rincian Pembayaran</h3>
                        <div className="mb-4">
                            <div>Subtotal: Rp{subtotal.toLocaleString("id-ID")}</div>
                            <div>Total: Rp{total.toLocaleString("id-ID")}</div>
                            <div>Dibayar: Rp{Number(paid).toLocaleString("id-ID")}</div>
                            <div>Kembalian: Rp{(Number(paid) - total).toLocaleString("id-ID")}</div>
                        </div>
                        <p className="mb-4">Apakah Anda yakin ingin melanjutkan checkout?</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={closeConfirmModal} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
                            <button onClick={() => { closeConfirmModal(); onCheckout(); setPaid("0");}} className="px-4 py-2 bg-green-600 text-white rounded">Ya, Checkout</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: search products */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
                    <div className="absolute inset-0 bg-black/50" onClick={closeModal}></div>
                    <div className="relative bg-white rounded shadow-lg w-full max-w-2xl mx-4">
                        <div className="p-4 border-b flex items-center gap-2">
                            <input
                                ref={searchRef}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama atau barcode..."
                                className="flex-1 border rounded px-3 py-2"
                            />
                            <button onClick={closeModal} className="px-3 py-1 rounded bg-gray-200">Tutup</button>
                        </div>

                        <div className="p-4 max-h-96 overflow-auto">
                            {loadingProducts ? (
                                <div className="text-center text-gray-500">Memuat...</div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center text-gray-500">Tidak ada produk</div>
                            ) : (
                                <ul className="divide-y">
                                    {filtered.map((p) => (
                                        <li key={p.id} className="py-2 flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{p.name}</div>
                                                <div className="text-sm text-gray-500">{p.barcode || "-"} • Rp{Number(p.price).toLocaleString("id-ID")}</div>
                                            </div>
                                            <div>
                                                <button onClick={() => addToCart(p)} className="px-3 py-1 bg-blue-600 text-white rounded">Tambah</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transaksi;
