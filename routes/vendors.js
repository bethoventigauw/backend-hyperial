import { Router } from 'express';
import Vendor from '../models/Vendor.js'; // Pastikan path impor model Vendor sudah benar
import VendorMaterial from '../models/VendorMaterial.js';
import Order from '../models/Order.js';
import Notification from '../models/Notifications.js';

const router = Router();

// Endpoint untuk menambahkan vendor
router.post('/add-vendor', async (req, res) => {
  const {
    VendorName, Address, City, State, ZipCode, Country, PhoneNumber, Email, Website,
    ContactPerson, GoodsOrServices, PaymentMethod, PaymentTerms, NPWP, BankDetails, Notes
  } = req.body;

  try {
    const vendor = await Vendor.create({
      VendorName, Address, City, State, ZipCode, Country, PhoneNumber, Email, Website,
      ContactPerson, GoodsOrServices, PaymentMethod, PaymentTerms, NPWP, BankDetails, Notes
    });
    res.json({ success: true, vendor });
  } catch (err) {
    console.error("Error in SQL query:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint untuk mendapatkan vendor berdasarkan ID
router.get('/get-vendor/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const vendor = await Vendor.findByPk(id); // Gunakan findByPk untuk MySQL
    if (!vendor) {
      return res.status(404).json({ message: "Vendor tidak ditemukan" });
    }
    res.json({ success: true, vendor });
  } catch (err) {
    console.error("Error in SQL query:", err); // Logging yang lebih deskriptif
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint untuk mengedit data vendor
router.put('/edit-vendor/:id', async (req, res) => {
  const { id } = req.params;
  const {
    VendorName, Address, City, State, ZipCode, Country, PhoneNumber, Email, Website,
    ContactPerson, GoodsOrServices, PaymentMethod, PaymentTerms, NPWP, BankDetails, Notes
  } = req.body;

  try {
    const vendor = await Vendor.findByPk(id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor tidak ditemukan" });
    }

    // Update data vendor
    await vendor.update({
      VendorName, Address, City, State, ZipCode, Country, PhoneNumber, Email, Website,
      ContactPerson, GoodsOrServices, PaymentMethod, PaymentTerms, NPWP, BankDetails, Notes
    });

    res.json({ success: true, vendor });
  } catch (err) {
    console.error("Error in SQL query:", err); // Logging yang lebih deskriptif
    res.status(500).json({ message: "Internal server error" });
  }
});


//mengambil data material vendor
router.get('/get-materials/:vendorId', async (req, res) => {
  const { vendorId } = req.params;

  try {
    const materials = await VendorMaterial.findAll({
      where: {
        VendorId: vendorId
      }
    });

    if (!materials || materials.length === 0) {
      return res.status(404).json({ message: "Material tidak ditemukan" });
    }

    res.json({ success: true, materials });
  } catch (err) {
    console.error("Error in SQL query:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint untuk menambahkan material vendor
router.post('/add-materials', async (req, res) => {
  const {
    VendorId, MaterialName, Description, Unit, Price, Quantity
  } = req.body;

  try {
    const material = await VendorMaterial.create({
      VendorId, MaterialName, Description, Unit, Price, Quantity
    });
    res.json({ success: true, material });
  } catch (err) {
    console.error("Error in SQL query:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// mengedit data material vendor
router.put('/edit-material/:id', async (req, res) => {
  const { id } = req.params;
  const {
    MaterialName, Description, Unit, Price, Quantity
  } = req.body;

  try {
    const material = await VendorMaterial.findByPk(id);
    if (!material) {
      return res.status(404).json({ message: "Material tidak ditemukan" });
    }

    // Update data material
    await material.update({
      MaterialName, Description, Unit, Price, Quantity
    });

    res.json({ success: true, material });
  } catch (err) {
    console.error("Error in SQL query:", err); // Logging yang lebih deskriptif
    res.status(500).json({ message: "Internal server error" });
  }
});

// Router untuk menghapus material dari vendor
router.delete('/delete-material/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const material = await VendorMaterial.findByPk(id);
    if (!material) {
      return res.status(404).json({ message: "Material tidak ditemukan" });
    }

    // Hapus material dari database
    await material.destroy();

    res.json({ success: true, message: "Material berhasil dihapus" });
  } catch (err) {
    console.error("Error in SQL query:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
