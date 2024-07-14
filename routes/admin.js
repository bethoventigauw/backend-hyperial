import express from 'express';
import WarehouseMaterial from '../models/WarehouseMaterial.js';
import MaterialExpenditure from '../models/MaterialExpenditure.js';
import Project from '../models/Proyek.js';
import sequelize from '../config/database.js';
import MaterialProyek from '../models/MaterialProyek.js';
const router = express.Router();

// Mendapatkan semua warehouse materials
router.get('/allMaterials', async (req, res) => {
  try {
    const materials = await WarehouseMaterial.findAll();
    res.status(200).json({ success: true, materials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar material.', error: error.message });
  }
});

// Mendapatkan warehouse material berdasarkan ID
router.get('/getMaterial/:id', async (req, res) => {
    try {
        const material = await WarehouseMaterial.findByPk(req.params.id);
        if (material) {
            res.json(material);
        } else {
            res.status(404).json({ error: 'Material not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Menambahkan warehouse material baru
router.post('/newMaterial', async (req, res) => {
    try {
        const newMaterial = await WarehouseMaterial.create(req.body);
        res.status(201).json(newMaterial);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mengupdate warehouse material
router.put('/editMaterial/:id', async (req, res) => {
    try {
        const material = await WarehouseMaterial.findByPk(req.params.id);
        if (material) {
            await material.update(req.body);
            res.json(material);
        } else {
            res.status(404).json({ error: 'Material not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Menghapus warehouse material
router.delete('/deleteMaterial/:id', async (req, res) => {
    try {
        const material = await WarehouseMaterial.findByPk(req.params.id);
        if (material) {
            await material.destroy();
            res.json({ message: 'Material deleted' });
        } else {
            res.status(404).json({ error: 'Material not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint untuk menambahkan pengeluaran material
router.post('/addExpenditure', async (req, res) => {
    const { WarehouseMaterialID, Quantity, Description } = req.body;
  
    try {
      // Pastikan material yang dikeluarkan ada di gudang
      const warehouseMaterial = await WarehouseMaterial.findByPk(WarehouseMaterialID);
      if (!warehouseMaterial) {
        return res.status(404).json({ success: false, message: 'Material tidak ditemukan di gudang.' });
      }
  
      // Kurangi jumlah material di gudang
      const updatedQuantity = warehouseMaterial.Quantity - Quantity;
      if (updatedQuantity < 0) {
        return res.status(400).json({ success: false, message: 'Jumlah material tidak mencukupi.' });
      }
  
      await warehouseMaterial.update({ Quantity: updatedQuantity });
  
      // Buat entri pengeluaran material
      const expenditure = await MaterialExpenditure.create({
        WarehouseMaterialID,
        Quantity,
        Description
      });
  
      res.status(201).json({ success: true, message: 'Pengeluaran material berhasil ditambahkan.', expenditure });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Gagal menambahkan pengeluaran material.', error: error.message });
    }
  });
  
  // Endpoint untuk mendapatkan daftar pengeluaran material
  router.get('/expenditures', async (req, res) => {
    try {
      const expenditures = await MaterialExpenditure.findAll({
        include: [WarehouseMaterial]
      });
  
      console.log('Expenditures:', JSON.stringify(expenditures, null, 2)); // Tambahkan logging di sini
  
      res.status(200).json({ success: true, expenditures });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Gagal mengambil daftar pengeluaran material.', error: error.message });
    }
  });

  // Endpoint untuk mendapatkan semua proyek dengan status 'Pending'
router.get('/pendingProjects', async (req, res) => {
  try {
      const projects = await Project.findAll({
          where: { status: 'Pending' },
          include: {
              model: MaterialProyek,
              include: [WarehouseMaterial]
          }
      });
      console.log('Fetched projects:', projects); // Tambahkan log ini
      res.status(200).json(projects);
  } catch (error) {
      console.error('Error fetching pending projects:', error);
      res.status(500).json({ error: 'Error fetching pending projects', details: error.message });
  }
});

// Endpoint untuk mendapatkan semua proyek
router.get('/allProjects', async (req, res) => {
    try {
        const projects = await Project.findAll({
            include: {
                model: MaterialProyek,
                include: [WarehouseMaterial]
            }
        });
        console.log('Fetched all projects:', projects);
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching all projects:', error);
        res.status(500).json({ error: 'Error fetching all projects', details: error.message });
    }
  });

// Endpoint untuk menyetujui proyek
router.post('/approveProject/:projectID', async (req, res) => {
    const { projectID } = req.params;
  
    try {
      const project = await Project.findByPk(projectID);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
  
      const materials = await MaterialProyek.findAll({ where: { projectID } });
      const insufficientStock = [];
      const updateStockPromises = materials.map(async (material) => {
        const warehouseMaterial = await WarehouseMaterial.findByPk(material.warehouseMaterialID);
        if (!warehouseMaterial || warehouseMaterial.Quantity < material.quantity) {
          insufficientStock.push({
            material: material.materialName,
            required: material.quantity,
            available: warehouseMaterial ? warehouseMaterial.Quantity : 0
          });
        } else {
          warehouseMaterial.Quantity -= material.quantity;
          material.approved = true; // Update material to approved
          await material.save();
          return warehouseMaterial.save();
        }
      });
  
      if (insufficientStock.length > 0) {
        project.notes = 'Stok kurang, silakan merequest material ke vendor';
        await project.save();
        return res.status(400).json({ error: 'Insufficient stock', details: insufficientStock });
      }
  
      await Promise.all(updateStockPromises);
      project.status = 'In Progress';
      project.notes = 'Update stok tersedia';
      await project.save();
  
      res.status(200).json({ message: 'Project approved and stock updated', project });
    } catch (error) {
      console.error('Error approving project:', error);
      res.status(500).json({ error: 'Error approving project', details: error.message });
    }
  });

  // Endpoint untuk menyetujui material tambahan
router.post('/approveAdditionalMaterial/:projectID', async (req, res) => {
    const { projectID } = req.params;
  
    try {
      const materials = await MaterialProyek.findAll({ where: { projectID, approved: false } });
      const insufficientStock = [];
      const updateStockPromises = materials.map(async (material) => {
        const warehouseMaterial = await WarehouseMaterial.findByPk(material.warehouseMaterialID);
        if (!warehouseMaterial || warehouseMaterial.Quantity < material.quantity) {
          insufficientStock.push({
            material: material.materialName,
            required: material.quantity,
            available: warehouseMaterial ? warehouseMaterial.Quantity : 0
          });
        } else {
          warehouseMaterial.Quantity -= material.quantity;
          material.approved = true; // Tambahkan flag approved pada material
          await material.save();
          return warehouseMaterial.save();
        }
      });
  
      if (insufficientStock.length > 0) {
        return res.status(400).json({ error: 'Insufficient stock', details: insufficientStock });
      }
  
      await Promise.all(updateStockPromises);
  
      res.status(200).json({ message: 'Additional materials approved and stock updated' });
    } catch (error) {
      console.error('Error approving additional materials:', error);
      res.status(500).json({ error: 'Error approving additional materials', details: error.message });
    }
  });

// Endpoint untuk memperbarui status proyek dan menambah catatan oleh admin
router.post('/updateProject/:projectID', async (req, res) => {
  const { projectID } = req.params;
  const { notes } = req.body;

  try {
      const project = await Project.findByPk(projectID);
      if (!project) {
          return res.status(404).json({ error: 'Project not found' });
      }

      project.status = 'In Progress';
      project.notes = project.notes ? project.notes + '\n' + notes : notes; // Menambahkan catatan baru ke catatan yang ada
      await project.save();

      res.status(200).json({ message: 'Project updated', project });
  } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'Error updating project', details: error.message });
  }
});

export default router;