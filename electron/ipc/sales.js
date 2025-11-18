const { ipcMain } = require("electron");
const { getDb } = require("../db");

function registerSalesIpc() {
  const { sequelize, Sale, SaleItem, Product } = getDb();

  // --- CHECKOUT (Transaksi Baru) ---
  ipcMain.handle("sales:checkout", async (_e, sale) => {
    if (!sale || !Array.isArray(sale.items) || !sale.items.length) {
      throw new Error("Keranjang kosong");
    }

    // Validasi item dasar
    for (const it of sale.items) {
      const qty = +it.qty;
      if (!Number.isFinite(qty) || qty <= 0) throw new Error("Qty tidak valid");
      const prod = await Product.findByPk(it.id);
      if (!prod) throw new Error(`Produk ${it.id} tidak ditemukan`);
    }

    return await sequelize.transaction(async (t) => {
      // 1. Buat Header Transaksi
      const head = await Sale.create(
        {
          datetime: new Date().toISOString(),
          subtotal: +sale.subtotal || 0,
          total: +sale.total || 0,
          paid: +sale.paid || 0,
          change: +sale.change || 0,
        },
        { transaction: t }
      );
      console.log("Created sale:", head.get({ plain: true }));

      // 2. Proses Setiap Item
      for (const it of sale.items) {
        const qty = +it.qty;

        // Ambil product dengan lock agar aman saat transaksi bersamaan
        const prod = await Product.findByPk(it.id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!prod) throw new Error(`Produk ${it.id} tidak ditemukan`);

        // Ambil harga snapshot dari DB
        const unitPrice = Number(prod.price || 0);

        // Simpan detail item
        await SaleItem.create(
          {
            saleId: head.id,
            productId: prod.id,
            qty,
            price: unitPrice,
            total: qty * unitPrice,
            productName: prod.name,
          },
          { transaction: t }
        );

        // Kurangi Stok
        const newStock = Math.max(0, (prod.stock || 0) - qty);
        await prod.update({ stock: newStock }, { transaction: t });
      }

      return head.id;
    });
  });

  // --- LIST (Ambil Semua Data) ---
  ipcMain.handle("sales:list", async () => {
    const rows = await Sale.findAll({
      order: [["datetime", "DESC"]], // Urutkan dari yang terbaru
      include: [SaleItem]
    });
    return rows.map((r) => r.get({ plain: true }));
  });

  // --- DELETE (Hapus Transaksi & Restore Stok) ---
  ipcMain.handle("sales:delete", async (_e, id) => {
    return await sequelize.transaction(async (t) => {
      // 1. Cari transaksi beserta item-nya
      const sale = await Sale.findByPk(id, {
        include: [SaleItem],
        transaction: t
      });

      if (!sale) throw new Error("Transaksi tidak ditemukan");

      // 2. Kembalikan stok barang (Loop setiap item yang terjual)
      for (const item of sale.SaleItems) {
        if (item.productId) {
          const product = await Product.findByPk(item.productId, { transaction: t });
          if (product) {
            // Tambahkan stok kembali (increment)
            await product.increment('stock', { by: item.qty, transaction: t });
          }
        }
      }

      // 3. Hapus Transaksi (SaleItem otomatis terhapus karena relasi database/cascade)
      await sale.destroy({ transaction: t });

      return true;
    });
  });

  // --- UPDATE (Edit Transaksi) ---
  ipcMain.handle("sales:update", async (_e, { id, datetime, total }) => {
    const sale = await Sale.findByPk(id);
    if (!sale) throw new Error("Transaksi tidak ditemukan");

    // Update hanya field yang dikirim
    await sale.update({
      datetime: datetime || sale.datetime,
      total: total !== undefined ? total : sale.total
    });

    return true;
  });
}

module.exports = { registerSalesIpc };