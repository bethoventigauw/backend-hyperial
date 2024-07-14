import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret_key';

// Middleware to verify JWT
export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Register route
router.post('/register', async (req, res) => {
  try {
    const { Username, Email, Password, Role, VendorName, Address, City, State, ZipCode, Country, PhoneNumber, Website, ContactPerson, GoodsOrServices, PaymentMethod, PaymentTerms, NPWP, BankDetails, Notes } = req.body;

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Create user
    const newUser = await User.create({
      Username,
      Email,
      Password: hashedPassword,
      Role
    });

    // Create Vendor if role is vendor
    if (Role === 'vendor') {
      const newVendor = await Vendor.create({
        VendorName,
        Address,
        City,
        State,
        ZipCode,
        Country,
        PhoneNumber,
        Email,
        Website,
        ContactPerson,
        GoodsOrServices,
        PaymentMethod,
        PaymentTerms,
        NPWP,
        BankDetails,
        Notes
      });

      await newUser.update({ VendorID: newVendor.VendorID });
    }

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error creating user', details: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({ valid: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { Email } });
    if (!user) {
      return res.status(401).json({ valid: false, message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(Password, user.Password);
    if (!validPassword) {
      return res.status(401).json({ valid: false, message: 'Invalid credentials' });
    }

    let vendorId = null;
    if (user.Role === 'vendor') {
      const vendor = await Vendor.findOne({ where: { Email } });
      if (vendor) {
        vendorId = vendor.VendorID;
      }
    }

    const token = jwt.sign({ UserID: user.UserID, Role: user.Role, VendorID: vendorId }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ valid: true, token, role: user.Role, vendorId });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ valid: false, error: 'Error logging in', details: error.message });
  }
});

// Admin login route
router.post('/adminLogin', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({ valid: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { Email } });
    if (!user || user.Role !== 'admin') {
      return res.status(401).json({ valid: false, message: 'Invalid credentials or not an admin' });
    }

    const validPassword = await bcrypt.compare(Password, user.Password);
    if (!validPassword) {
      return res.status(401).json({ valid: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ UserID: user.UserID, Role: user.Role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ valid: true, token, role: user.Role });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ valid: false, error: 'Error logging in', details: error.message });
  }
});

// Protected route for vendor data
router.get('/vendor', authenticateToken, async (req, res) => {
  if (req.user.Role !== 'vendor') {
    return res.sendStatus(403);
  }
  try {
    const vendor = await Vendor.findOne({ where: { VendorID: req.user.VendorID } });
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.status(200).json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ error: 'Error fetching vendor', details: error.message });
  }
});

// Protected route for staff data
router.get('/proyekManager', authenticateToken, async (req, res) => {
  if (req.user.Role !== 'ProjectManager') {
    return res.sendStatus(403);
  }
  try {
    const user = await User.findOne({ where: { UserID: req.user.UserID } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Error fetching user', details: error.message });
  }
});

export default router;
