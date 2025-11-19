import React from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
    const navLinkClass = ({ isActive }) =>
        `px-3 py-2 rounded transition-colors ${isActive ? "bg-blue-600 text-white" : "text-gray-200 hover:bg-gray-700"
        }`;

    return (
        <header className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
            <nav className="flex justify-between items-center px-4 py-3">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-wide">Kasir App</h1>
                </div>

                <div className="flex gap-1 overflow-x-auto">
                    <NavLink to="/" className={navLinkClass} end>
                        Kasir
                    </NavLink>
                    <NavLink to="/list" className={navLinkClass}>
                        Daftar Produk
                    </NavLink>
                    <NavLink to="/riwayat" className={navLinkClass}>
                        Riwayat
                    </NavLink>
                    <NavLink to="/pendapatan" className={navLinkClass}>
                        Pendapatan
                    </NavLink>
                    {/* Menu Baru */}
                    <NavLink to="/pengeluaran" className={navLinkClass}>
                        Pengeluaran
                    </NavLink>
                </div>
            </nav>
        </header>
    );
};

export default Header;