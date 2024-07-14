import express from 'express';
import VendorMaterial from '../models/VendorMaterial.js';
import Order from '../models/Order.js';
import OrderLine from '../models/OrderLine.js';
import Vendor from '../models/Vendor.js';
import Notification from '../models/Notifications.js';
import Invoice from '../models/Invoice.js';
import sequelize from '../config/database.js';
import WarehouseMaterial from '../models/WarehouseMaterial.js';

const router = express.Router();

// Buat Order baru
router.post('/newOrder', async (req, res) => {
  const { VendorID, items } = req.body;

  try {
    // Buat entry di tabel Order
    const newOrder = await Order.create({
      VendorID,
      OrderDate: new Date(),
      Shipping: 'Pending',
      TotalAmount: 0 // Placeholder, akan dihitung nanti
    });

    let totalAmount = 0;

    // Buat entry di tabel OrderLine dan notifikasi untuk setiap item
    for (const item of items) {
      const vendorMaterial = await VendorMaterial.findByPk(item.VendorMaterialID);

      if (!vendorMaterial) {
        return res.status(400).json({ success: false, message: `VendorMaterial dengan ID ${item.VendorMaterialID} tidak ditemukan.` });
      }

      await OrderLine.create({
        OrderID: newOrder.OrderID,
        VendorMaterialID: item.VendorMaterialID,
        Quantity: item.Quantity
      });

      // Tambahkan ke total amount
      totalAmount += vendorMaterial.Price * item.Quantity;

      // Buat notifikasi untuk vendor
      await Notification.create({
        VendorID: vendorMaterial.VendorId,
        OrderID: newOrder.OrderID,
        VendorMaterialID: item.VendorMaterialID, // Tambahkan VendorMaterialID di notifikasi
        Shipping: 'Pending',
        Message: `Pesanan baru untuk material ${vendorMaterial.MaterialName}`
      });
    }

    // Update total amount di Order
    await newOrder.update({ TotalAmount: totalAmount });

    // Buat entry di tabel Invoice
    await Invoice.create({
      OrderId: newOrder.OrderID,
      InvoiceDate: new Date(),
      DueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Set due date 30 hari setelah invoice date
      Subtotal: totalAmount,
      Tax: totalAmount * 0.1, // Misal pajak 10%
      Discount: 0, // Misal tidak ada diskon
      TotalAmount: totalAmount * 1.1, // Subtotal + Pajak
      Status: 'Unpaid',
      Notes: 'Terima kasih telah berbelanja dengan kami.'
    });

    res.status(201).json({ success: true, message: 'Order dan invoice berhasil dibuat.', orderId: newOrder.OrderID });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal membuat order.', error: error.message });
  }
});


// Endpoint untuk mendapatkan daftar vendor
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await Vendor.findAll();
    res.status(200).json({ success: true, vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar vendor.', error: error.message });
  }
});

// Endpoint untuk mendapatkan daftar material
router.get('/materials', async (req, res) => {
  try {
    const materials = await VendorMaterial.findAll({
      include: [{
        model: Vendor,
        attributes: ['VendorName']
      }]
    });
    res.status(200).json({ success: true, materials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar material.', error: error.message });
  }
});

// Endpoint untuk mendapatkan daftar order
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar order.', error: error.message });
  }
});

// Endpoint untuk mendapatkan detail invoice
router.get('/invoice/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    const invoice = await Invoice.findOne({
      where: { OrderId: orderId },
      include: {
        model: Order,
        include: {
          model: Vendor,
          attributes: ['VendorName']
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan.' });
    }

    const orderDetails = await OrderLine.findAll({
      where: { OrderID: orderId },
      include: [VendorMaterial]
    });

    res.status(200).json({
      success: true,
      invoice: {
        ...invoice.dataValues,
        VendorName: invoice.Order.Vendor.VendorName,
        orderDetails
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil invoice.', error: error.message });
  }
});

// Endpoint untuk mendapatkan notifikasi vendor
router.get('/notifications/:vendorId', async (req, res) => {
  const { vendorId } = req.params;

  if (!vendorId) {
    return res.status(400).json({ success: false, message: 'Vendor ID is required.' });
  }

  try {
    const notifications = await Notification.findAll({
      where: { VendorID: vendorId },
      include: [Order]
    });
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil notifikasi.', error: error.message });
  }
});

//notifikasi acc vendor
router.post('/notifications/:orderId/deliver', async (req, res) => {
  const { orderId } = req.params;

  try {
    const notifications = await Notification.findAll({
      where: { OrderID: orderId, Shipping: 'Pending' }
    });
    
    if (notifications.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada notifikasi yang pending untuk order ini.' });
    }

    // Update status notifikasi
    await Notification.update({ Shipping: 'Delivered' }, {
      where: { OrderID: orderId }
    });

    // Update status order jika semua notifikasi sudah di-delivered
    const allDelivered = await Notification.findAll({
      where: { OrderID: orderId, Shipping: 'Pending' }
    });

    if (allDelivered.length === 0) {
      const order = await Order.findByPk(orderId);
      await order.update({ Shipping: 'Delivered' });
    }

    // Mengurangi quantity pada VendorMaterial untuk seluruh order
    const orderLines = await OrderLine.findAll({
      where: { OrderID: orderId },
      include: [VendorMaterial]
    });

    for (const line of orderLines) {
      const vendorMaterial = line.VendorMaterial;
      const newQuantity = vendorMaterial.Quantity - line.Quantity;

      // Pastikan quantity tidak negatif
      if (newQuantity < 0) {
        return res.status(400).json({ success: false, message: `Quantity untuk ${vendorMaterial.MaterialName} tidak mencukupi.` });
      }

      await vendorMaterial.update({ Quantity: newQuantity });
    }

    res.status(200).json({ success: true, message: 'Order berhasil diubah menjadi Delivered dan stok VendorMaterial telah dikurangi.' });
  } catch (error) {
    console.error('Error delivering order:', error.message);
    res.status(500).json({ success: false, message: 'Gagal mengubah status order.', error: error.message });
  }
});


// Endpoint untuk mengubah status order menjadi Received
router.post('/orders/:orderId/receive', async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan.' });
    }

    // Update status order
    await order.update({ Shipping: 'Received' });

    // Tambah ke inventori gudang admin
    const orderLines = await OrderLine.findAll({
      where: { OrderID: orderId },
      include: [VendorMaterial]
    });

    for (const line of orderLines) {
      const vendorMaterial = line.VendorMaterial;

      const [warehouseMaterial, created] = await WarehouseMaterial.findOrCreate({
        where: { MaterialName: vendorMaterial.MaterialName },
        defaults: {
          Description: vendorMaterial.Description,
          Unit: vendorMaterial.Unit,
          Quantity: line.Quantity,
          Location: 'Default Location' // Sesuaikan dengan lokasi gudang yang diinginkan
        }
      });

      if (!created) {
        // Jika material sudah ada di gudang, tambahkan jumlahnya
        await warehouseMaterial.update({
          Quantity: warehouseMaterial.Quantity + line.Quantity
        });
      }
    }

    res.status(200).json({ success: true, message: 'Order berhasil diterima dan stok WarehouseMaterial telah ditambahkan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menerima order.', error: error.message });
  }
});

// Endpoint untuk mendapatkan detail order
router.get('/orderDetails/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    const orderDetails = await OrderLine.findAll({
      where: { OrderID: orderId },
      include: [VendorMaterial]
    });

    if (!orderDetails.length) {
      return res.status(404).json({ success: false, message: 'Detail order tidak ditemukan.' });
    }

    res.status(200).json({ success: true, orderDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail order.', error: error.message });
  }
});

export default router;