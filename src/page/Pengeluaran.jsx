import React, { useEffect, useState } from "react";
import { useToast } from "../stores/useToast";
import { useConfirm } from "../stores/useConfirm";
import CurrencyInput from "../component/CurrencyInput"; // Import komponen baru

// Icons
const IconPlus = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const IconTrash = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconStore = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;

const Pengeluaran = () => {
    const toast = useToast((s) => s.push);
    const confirm = useConfirm((s) => s.open);

    // State Data
    const [suppliers, setSuppliers] = useState([]);
    const [expenses, setExpenses] = useState([]);

    // State Form Pengeluaran
    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [nominal, setNominal] = useState("");

    // State Modal Tambah Toko
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState("");

    // Load Data
    const loadData = async () => {
        try {
            const s = await window.api.expenses.listSuppliers();
            const e = await window.api.expenses.listExpenses();
            setSuppliers(s || []);
            setExpenses(e || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { loadData(); }, []);

    // --- Handler Supplier (Toko) ---
    const handleAddSupplier = async (e) => {
        e.preventDefault();
        if (!newSupplierName.trim()) return;
        try {
            await window.api.expenses.addSupplier(newSupplierName);
            toast({ type: "success", title: "Sukses", message: "Toko berhasil ditambahkan" });
            setNewSupplierName("");
            setShowSupplierModal(false);
            loadData();
        } catch (err) {
            toast({ type: "error", title: "Gagal", message: err.message });
        }
    };

    const handleDeleteSupplier = async (id, name) => {
        const ok = await confirm({ title: "Hapus Toko?", message: `Hapus "${name}" dari daftar?` });
        if (!ok) return;

        try {
            await window.api.expenses.deleteSupplier(id);
            toast({ type: "success", title: "Terhapus", message: "Data toko dihapus" });
            loadData();
            if (selectedSupplier == id) setSelectedSupplier("");
        } catch (err) {
            toast({ type: "error", title: "Gagal", message: "Tidak bisa menghapus toko yang sudah ada riwayat transaksi" });
        }
    };

    // --- Handler Expense (Pengeluaran) ---
    const handleSubmitExpense = async (e) => {
        e.preventDefault();
        if (!selectedSupplier) return toast({ type: "error", title: "Error", message: "Pilih toko Supplier dulu" });
        if (!nominal) return toast({ type: "error", title: "Error", message: "Isi nominal" });

        try {
            await window.api.expenses.addExpense({
                supplierId: selectedSupplier,
                amount: nominal
            });
            toast({ type: "success", title: "Tersimpan", message: "Data pengeluaran dicatat" });
            setNominal("");
            loadData();
        } catch (err) {
            toast({ type: "error", title: "Gagal", message: err.message });
        }
    };

    const handleDeleteExpense = async (id) => {
        const ok = await confirm({ title: "Hapus Catatan?", message: "Data akan dihapus permanen." });
        if (!ok) return;
        try {
            await window.api.expenses.deleteExpense(id);
            toast({ type: "success", title: "Terhapus", message: "Catatan dihapus" });
            loadData();
        } catch (err) {
            toast({ type: "error", title: "Gagal", message: err.message });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
            <div className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-20 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Pengeluaran Harian (Supplier)</h1>
                <p className="text-sm text-gray-500 mt-0.5">Catat belanja stok barang disini</p>
            </div>

            <div className="flex-1 p-6 max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-6">

                {/* LEFT: Input Form */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <IconStore /> Input Belanja
                        </h2>

                        <form onSubmit={handleSubmitExpense} className="flex flex-col gap-4">
                            {/* Input Toko */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Di Toko Mana?</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowSupplierModal(true)}
                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <IconPlus /> Tambah Toko
                                    </button>
                                </div>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={selectedSupplier}
                                    onChange={(e) => setSelectedSupplier(e.target.value)}
                                >
                                    <option value="">-- Pilih Toko / Supplier --</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Input Nominal (UPDATED) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nominal Belanja (Rp)</label>
                                <CurrencyInput
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="0"
                                    value={nominal}
                                    onChange={setNominal}
                                />
                            </div>

                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 mt-2"
                            >
                                SIMPAN PENGELUARAN
                            </button>
                        </form>
                    </div>

                    {/* List Toko (Untuk Manage/Delete) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex-1">
                        <h3 className="font-bold text-gray-700 mb-3 text-sm">Daftar Toko Langganan</h3>
                        <div className="overflow-y-auto max-h-64 space-y-2 pr-2">
                            {suppliers.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">Belum ada data toko.</p>
                            ) : (
                                suppliers.map(s => (
                                    <div key={s.id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded border border-gray-100 group">
                                        <span className="text-sm text-gray-700">{s.name}</span>
                                        <button
                                            onClick={() => handleDeleteSupplier(s.id, s.name)}
                                            className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <IconTrash />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: History Table */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-bold text-gray-800">Riwayat Pengeluaran Terakhir</h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 w-32">Waktu</th>
                                    <th className="px-6 py-3">Toko / Supplier</th>
                                    <th className="px-6 py-3 text-right">Nominal</th>
                                    <th className="px-6 py-3 text-center w-20">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {expenses.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400">Belum ada data pengeluaran.</td></tr>
                                ) : (
                                    expenses.map(ex => (
                                        <tr key={ex.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-3 text-gray-500">
                                                {new Date(ex.date).toLocaleDateString('id-ID')} <br />
                                                <span className="text-xs">{new Date(ex.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td className="px-6 py-3 font-medium text-gray-800">
                                                {ex.supplierName}
                                            </td>
                                            <td className="px-6 py-3 text-right font-bold text-red-600">
                                                -Rp{Number(ex.amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <button
                                                    onClick={() => handleDeleteExpense(ex.id)}
                                                    className="text-gray-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition-all"
                                                >
                                                    <IconTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Tambah Supplier */}
            {showSupplierModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Tambah Toko / Supplier</h3>
                        <form onSubmit={handleAddSupplier}>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Toko</label>
                            <input
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                                autoFocus
                                placeholder="Contoh: Toko Beras Makmur"
                                value={newSupplierName}
                                onChange={(e) => setNewSupplierName(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSupplierModal(false)}
                                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pengeluaran;