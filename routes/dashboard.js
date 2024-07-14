import express from 'express';
import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Project from '../models/Proyek.js';
import sequelize from '../config/database.js';
import Vendor from '../models/Vendor.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // Total Pengeluaran Uang Semua Invoices
        const totalInvoiceAmount = await Invoice.sum('TotalAmount');

        // Jumlah Total Order
        const totalOrders = await Order.count();

        // Jumlah Total User
        const totalUsers = await User.count();

        // Jumlah Total Project
        const totalProjects = await Project.count();

        // Recent Invoices
        const recentInvoices = await Invoice.findAll({
            limit: 5,
            order: [['InvoiceDate', 'DESC']],
            include: [{ model: Order }]
        });

        // Recent Orders
        const recentOrders = await Order.findAll({
            limit: 5,
            order: [['OrderDate', 'DESC']],
            include: [{ model: Vendor }]
        });

        // Recent Projects
        const recentProjects = await Project.findAll({
            limit: 5,
            order: [['startDate', 'DESC']]
        });

        // Project Duration Calculation
        const projectDurations = await sequelize.query(
            `SELECT nama_project, DATEDIFF(IFNULL(endDate, NOW()), startDate) as duration
             FROM projects
             ORDER BY startDate DESC`,
            { type: sequelize.QueryTypes.SELECT }
        );

        // Order Status Distribution
        const orderStatusDistribution = await Order.findAll({
            attributes: ['Shipping', [sequelize.fn('COUNT', sequelize.col('Shipping')), 'count']],
            group: ['Shipping']
        });

        // Project Status Overview
        const projectStatusOverview = await Project.findAll({
            attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
            group: ['status']
        });

        // User List
        const userList = await User.findAll({
            attributes: ['UserID', 'Username', 'Email', 'Role', 'CreatedAt']
        });

        res.status(200).json({
            totalInvoiceAmount,
            totalOrders,
            totalUsers,
            totalProjects,
            recentInvoices,
            recentOrders,
            recentProjects,
            projectDurations, // Add project durations to response
            orderStatusDistribution,
            projectStatusOverview,
            userList,
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error); // Log the error
        res.status(500).json({ error: error.message });
    }
});

export default router;
