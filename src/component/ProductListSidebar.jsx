import React, { useState, useMemo, useEffect, useRef } from "react";

// Icon Sederhana
const IconSearch = () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IconClose = () => <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

const ProductListSidebar = ({ isOpen, onClose, onSelectProduct }) => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    const searchRef = useRef(null);
    const itemRefs = useRef([]);

    // Load data saat modal dibuka
    useEffect(() => {
        if (isOpen) {
            setSelectedIndex(0);
            setTimeout(() => searchRef.current?.focus(), 50);
            window.api.products.list().then((res) => setProducts(res || [])).catch(console.error);
        }
    }, [isOpen]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return products;
        return products.filter((p) =>
            (p.name || "").toLowerCase().includes(q) ||
            (p.barcode || "").toLowerCase().includes(q)
        );
    }, [products, search]);

    // Reset index saat hasil pencarian berubah
    useEffect(() => setSelectedIndex(0), [filtered]);

    // Navigasi Keyboard
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex(prev => {
                    const next = Math.min(prev + 1, filtered.length - 1);
                    itemRefs.current[next]?.scrollIntoView({ block: "nearest" });
                    return next;
                });
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex(prev => {
                    const next = Math.max(prev - 1, 0);
                    itemRefs.current[next]?.scrollIntoView({ block: "nearest" });
                    return next;
                });
            } else if (e.key === "Enter" && filtered[selectedIndex]) {
                e.preventDefault();
                onSelectProduct(filtered[selectedIndex]);
            } else if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, filtered, selectedIndex, onSelectProduct, onClose]);

    const rp = (n) => "Rp" + Number(n).toLocaleString("id-ID");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-black/30 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-3xl flex flex-col max-h-[80vh] rounded-xl shadow-xl border border-gray-200 overflow-hidden">

                {/* Header Pencarian */}
                <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
                    <IconSearch />
                    <input
                        ref={searchRef}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari barang... (Gunakan Panah & Enter)"
                        className="flex-1 text-lg outline-none placeholder:text-gray-400 text-gray-800"
                        autoComplete="off"
                    />
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <IconClose />
                    </button>
                </div>

                {/* List Barang */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-2">
                    {filtered.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">Tidak ada produk ditemukan</div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {filtered.map((p, idx) => {
                                const isSelected = idx === selectedIndex;
                                return (
                                    <button
                                        key={p.id}
                                        ref={el => itemRefs.current[idx] = el}
                                        onClick={() => onSelectProduct(p)}
                                        className={`flex items-center justify-between w-full p-3 text-left rounded-lg border transition-colors ${isSelected
                                                ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 z-10'
                                                : 'bg-white border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            {/* Barcode di kiri, lebar tetap agar rapi */}
                                            <div className="w-32 shrink-0 font-mono text-xs text-gray-500 truncate bg-gray-100 px-2 py-1 rounded text-center">
                                                {p.barcode || "-"}
                                            </div>

                                            {/* Nama & Stok */}
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-semibold truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                                                    {p.name}
                                                </div>
                                                <div className="text-xs text-gray-500">Stok: {p.stock}</div>
                                            </div>
                                        </div>

                                        {/* Harga */}
                                        <div className="font-bold text-gray-900 pl-4 whitespace-nowrap">
                                            {rp(p.price)}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
                    <span>Total: {filtered.length} produk</span>
                    <span>[↑/↓] Navigasi • [Enter] Pilih • [Esc] Tutup</span>
                </div>
            </div>
        </div>
    );
};

export default ProductListSidebar;