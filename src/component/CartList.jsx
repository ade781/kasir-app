import React from "react";

// Icons
const IconMinus = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>;
const IconPlus = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const IconTrash = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconCartEmpty = () => <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

const CartList = ({ cart, onIncrement, onDecrement, onChangeQty, onRemove }) => {
    const rp = (n) => "Rp" + Number(n).toLocaleString("id-ID");

    return (
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-700">Keranjang Belanja</h2>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{cart.length} Item</span>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-3">Produk</th>
                            <th className="px-4 py-3 text-right">Harga</th>
                            <th className="px-4 py-3 text-center">Qty</th>
                            <th className="px-6 py-3 text-right">Total</th>
                            <th className="px-4 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {cart.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <IconCartEmpty />
                                        <p className="mt-4 font-medium text-gray-500">Keranjang masih kosong</p>
                                        <p className="text-sm">Scan barcode atau klik "Cari Barang" untuk memulai.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            cart.map((it) => (
                                <tr key={it.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-800">{it.name}</div>
                                        {it.barcode && <div className="text-xs text-gray-500 font-mono mt-0.5">{it.barcode}</div>}
                                    </td>
                                    <td className="px-4 py-4 text-right font-medium text-gray-600">
                                        {rp(it.price)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center bg-white border border-gray-300 rounded-lg w-max mx-auto shadow-sm">
                                            <button onClick={() => onDecrement(it.id)} className="px-3 py-1 hover:bg-gray-100 text-gray-600 transition-colors rounded-l-lg"><IconMinus /></button>
                                            <input
                                                value={it.qty}
                                                onChange={(e) => onChangeQty(it.id, e.target.value)}
                                                className="w-12 text-center font-semibold text-gray-800 outline-none border-x border-gray-200 py-1"
                                            />
                                            <button onClick={() => onIncrement(it.id)} className="px-3 py-1 hover:bg-gray-100 text-gray-600 transition-colors rounded-r-lg"><IconPlus /></button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-800">
                                        {rp(it.price * it.qty)}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <button
                                            onClick={() => onRemove(it.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                            title="Hapus"
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
    );
};

export default CartList;