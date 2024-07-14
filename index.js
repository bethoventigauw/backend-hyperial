import express, { json as expressJson } from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import pkg from 'body-parser';
import sequelize from './config/database.js'; // Impor instance sequelize
import jwt from 'jsonwebtoken';
import authRoutes from './routes/authen.js';
import vendorRoutes from './routes/vendors.js';
import adminRoutes from './routes/admin.js';
import orderRoutes from './routes/order.js';
import dashboardRoutes from './routes/dashboard.js';
import usermanagementRoutes from './routes/usermanagement.js';
import projectmanagerRoutes from './routes/projectmanager.js';
import './models/associations.js';

const { json: bodyParserJson } = pkg;
const JWT_SECRET = 'your_secret_key_here';
const app = express();
const port = 5000;

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(expressJson());
app.use(cookieParser());
app.use(bodyParserJson());

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// Use routes
app.use('/authen', authRoutes);
app.use('/vendors', vendorRoutes);
app.use('/admin', adminRoutes);
app.use('/order', orderRoutes);
app.use('/user', usermanagementRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/projectmanager', projectmanagerRoutes);





app.get('/', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.json({ valid: false });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.json({ valid: false });
    }
    req.user = user;
    res.json({ valid: true, role: user.Role });
  });
});

app.get('/logout', (req, res) => {
  res.clearCookie('authorization'); // Menghapus cookie dengan nama 'authorization'
  res.status(200).json("success");
});

// Sync database
sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
  // Jalankan server
  app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
  });
});