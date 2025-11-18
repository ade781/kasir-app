import React from "react";

const InvoiceModal = ({ sale, onClose }) => {
    if (!sale) return null;

    return (
        // Overlay background (hitam transparan)
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:p-0 print:bg-white">

            {/* Kertas Nota */}
            <div className="bg-white w-full max-w-md rounded shadow-lg overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:w-full print:max-w-none print:max-h-none print:rounded-none">

                {/* Header Modal (Tombol Close - Disembunyikan saat print) */}
                <div className="p-3 border-b flex justify-between items-center print:hidden bg-gray-50">
                    <h3 className="font-bold text-gray-700">Nota Transaksi</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-600 font-bold px-2">
                        ✕
                    </button>
                </div>

                {/* Area Konten Nota (Scrollable) */}
                <div className="p-6 overflow-y-auto flex-1 text-sm print:overflow-visible" id="printable-area">

                    {/* Header Toko */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold uppercase tracking-widest border-b-2 border-black inline-block pb-1 mb-2">KASIR APP</h2>
                        <p className="text-gray-500">Jalan Raya Contoh No. 123</p>
                        <p className="text-gray-500">Telp: 0812-3456-7890</p>
                    </div>

                    {/* Info Transaksi */}
                    <div className="border-b border-dashed border-gray-400 mb-4 pb-2 font-mono text-xs">
                        <div className="flex justify-between">
                            <span>No: #{sale.id}</span>
                            <span>{new Date(sale.datetime).toLocaleDateString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Kasir: Admin</span>
                            <span>{new Date(sale.datetime).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>

                    {/* Tabel Barang */}
                    <table className="w-full mb-4 font-mono text-xs">
                        <thead>
                            <tr className="border-b border-black">
                                <th className="text-left py-1">Item</th>
                                <th className="text-right py-1">Qty</th>
                                <th className="text-right py-1">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(sale.SaleItems || []).map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-1 pr-2">
                                        <div className="font-semibold">{item.productName}</div>
                                        <div className="text-gray-500">@Rp{Number(item.price).toLocaleString("id-ID")}</div>
                                    </td>
                                    <td className="text-right py-1 align-top">{item.qty}</td>
                                    <td className="text-right py-1 align-top">
                                        Rp{Number(item.total || item.price * item.qty).toLocaleString("id-ID")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Total & Pembayaran */}
                    <div className="border-t border-dashed border-gray-400 pt-2 font-mono text-sm">
                        <div className="flex justify-between mb-1">
                            <span>Subtotal</span>
                            <span>Rp{Number(sale.subtotal).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg mb-2">
                            <span>Total</span>
                            <span>Rp{Number(sale.total).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span>Tunai</span>
                            <span>Rp{Number(sale.paid).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span>Kembali</span>
                            <span>Rp{Number(sale.change).toLocaleString("id-ID")}</span>
                        </div>
                    </div>

                    {/* Footer Nota */}
                    <div className="text-center mt-8 text-xs text-gray-400">
                        <p>-- Terima Kasih --</p>
                        <p>Barang yang sudah dibeli tidak dapat ditukar</p>
                    </div>
                </div>

                {/* Footer Tombol Aksi (Sembunyi saat print) */}
                <div className="p-4 border-t bg-gray-50 flex gap-2 print:hidden">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                    >
                        Tutup
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2"
                    >
                        <span>🖨️</span> Cetak / PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;