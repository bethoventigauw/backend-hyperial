// routes/usermanagement.js
import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js'; // Pastikan path impor model User sudah benar
import Vendor from '../models/Vendor.js'; // Pastikan path impor model Vendor sudah benar

const router = Router();

// Endpoint untuk menambahkan user baru
router.post('/add-user', async (req, res) => {
  const { username, password, email, role, vendorId } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      Username: username,
      Password: hashedPassword,
      Email: email,
      Role: role,
      VendorID: vendorId
    });
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error in SQL query:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint untuk mendapatkan daftar semua pengguna beserta detail vendor
router.get('/get-users', async (req, res) => {
  try {
    const users = await User.findAll({
      include: {
        model: Vendor,
        as: 'vendorDetails'
      }
    });
    res.json({ success: true, users });
  } catch (err) {
    console.error("Error in SQL query:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint untuk mendapatkan pengguna berdasarkan ID beserta detail vendor
router.get('/get-user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, {
      include: {
        model: Vendor,
        as: 'vendorDetails'
      }
    });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error in SQL query:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint untuk mengedit data pengguna
router.put('/edit-user/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, role, vendorId } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Update data pengguna
    await user.update({
      Username: username,
      Email: email,
      Role: role,
      VendorID: vendorId
    });

    res.json({ success: true, user });
  } catch (err) {
    console.error("Error in SQL query:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint untuk menghapus pengguna
router.delete('/delete-user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Hapus pengguna dari database
    await user.destroy();

    res.json({ success: true, message: "User berhasil dihapus" });
  } catch (err) {
    console.error("Error in SQL query:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
