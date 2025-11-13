import React from "react";
import { useNavigate } from "react-router-dom";
const Header = () => {
    const navigate = useNavigate();
    return (
        <header className="bg-gray-800 text-white p-4">
            <h1 className="text-2xl font-bold">Kasir App</h1>
            <button onClick={() => navigate("/")}>Kasir</button>
            <button onClick={() => navigate("/list")}>Daftar Produk</button>
            <button onClick={() => navigate("/riwayat")}>Riwayat Transaksi</button>
            <button onClick={() => navigate("/pendapatan")}>Pendapatan</button>
        </header>
    );
};

export default Header;
