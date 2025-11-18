const { ipcMain } = require("electron");
const { getDb } = require("../db");

function registerProductIpc() {
  const { Product } = getDb();

  ipcMain.handle("products:list", async () => {
    const products = await Product.findAll({ order: [["name", "ASC"]] });
    return products.map((p) => p.get({ plain: true }));
  });

  ipcMain.handle("products:add", async (_e, p) => {
    // Validasi sederhana
    const name = (p?.name || "").toString().trim();
    const price = Number.isFinite(+p?.price) ? +p.price : 0;
    const stock = Number.isFinite(+p?.stock) ? +p.stock : 0;

    if (!name) throw new Error("Nama produk wajib diisi");
    if (price < 0 || stock < 0) throw new Error("Harga/Stok tidak valid");

    console.log("Adding product:", { barcode: p?.barcode || null, name, price, stock });
    const created = await Product.create({
      barcode: p?.barcode || null,
      name, price, stock,
    });

    return { id: created.id };
  });

  ipcMain.handle("products:byBarcode", async (_e, barcode) => {
    const product = await Product.findOne({ where: { barcode } });
    return product ? product.get({ plain: true }) : null;
  });

  ipcMain.handle("products:byId", async (_e, id) => {
    const product = await Product.findByPk(id);
    return product ? product.get({ plain: true }) : null;
  });

  ipcMain.handle("products:update", async (_e, id, delta) => {
    const product = await Product.findByPk(id);
    if (!product) throw new Error("Produk tidak ditemukan");
    await product.update(delta);
    return { id };
  });

  ipcMain.handle("products:delete", async (_e, id) => {
    const product = await Product.findByPk(id);
    if (!product) throw new Error("Produk tidak ditemukan");
    await product.destroy();
    return { id };
  });
}

module.exports = { registerProductIpc };
