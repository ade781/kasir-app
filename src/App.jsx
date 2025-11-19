import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Toast from './component/Toast.jsx';
import Confirm from './component/Confirm.jsx';
import ProductList from './page/ProductList.jsx';
import AddProduct from './page/AddProduct.jsx';
import EditProduct from './page/EditProduct.jsx';
import Transaksi from './page/Transaksi.jsx';
import Header from './component/Header.jsx';
import Riwayat from './page/Riwayat.jsx';
import Pendapatan from './page/Pendapatan.jsx';
import Pengeluaran from './page/Pengeluaran.jsx'; // Import Page Baru

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Transaksi />} />
        <Route path="/list" element={<ProductList />} />
        <Route path="/add" element={<AddProduct />} />
        <Route path="/edit/:id" element={<EditProduct />} />
        <Route path="/riwayat" element={<Riwayat />} />
        <Route path="/pendapatan" element={<Pendapatan />} />
        {/* Route Baru */}
        <Route path="/pengeluaran" element={<Pengeluaran />} />
      </Routes>
      <Toast />
      <Confirm />
    </BrowserRouter>
  )
}

export default App;