import express from 'express';
import Project from '../models/Proyek.js';
import MaterialProyek from '../models/MaterialProyek.js';
import WarehouseMaterial from '../models/WarehouseMaterial.js';
import { authenticateToken } from './authen.js';

const router = express.Router();

// Route untuk menambah proyek beserta material proyek
router.post('/addProjectWithMaterials', authenticateToken, async (req, res) => {
  if (req.user.Role !== 'ProjectManager') {
    return res.sendStatus(403);
  }

  try {
    const {
      nama_project,
      location,
      startDate,
      endDate,
      description,
      projectManager,
      notes,
      materials
    } = req.body;

    console.log('Received project data:', { nama_project, location, startDate, endDate, description, projectManager, notes, materials });

    const newProject = await Project.create({
      nama_project,
      location,
      startDate,
      endDate,
      description,
      projectManager,
      notes,
      createdBy: req.user.UserID
    });

    const materialProyekPromises = materials.map(material => {
      console.log('Creating material for project:', material);
      return MaterialProyek.create({
        projectID: newProject.projectID,
        warehouseMaterialID: material.warehouseMaterialID,
        materialName: material.materialName, // Pastikan ini sesuai dengan nama kolom di tabel
        quantity: material.quantity
      });
    });

    await Promise.all(materialProyekPromises);

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project with materials:', error);
    res.status(500).json({ error: 'Error creating project with materials', details: error.message });
  }
});

// Route untuk menambah material tambahan ke proyek yang sudah ada
router.post('/addAdditionalMaterial/:projectID', authenticateToken, async (req, res) => {
  if (req.user.Role !== 'ProjectManager') {
    return res.sendStatus(403);
  }

  const { projectID } = req.params;
  const { materials } = req.body;

  try {
    const project = await Project.findByPk(projectID);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const materialProyekPromises = materials.map(material => {
      return MaterialProyek.create({
        projectID: project.projectID,
        warehouseMaterialID: material.warehouseMaterialID,
        materialName: material.materialName,
        quantity: material.quantity,
        approved: false // Pastikan flag ini diatur ke false secara default
      });
    });

    await Promise.all(materialProyekPromises);

    res.status(201).json({ message: 'Materials added successfully' });
  } catch (error) {
    console.error('Error adding additional materials:', error);
    res.status(500).json({ error: 'Error adding additional materials', details: error.message });
  }
});


// Route untuk mendapatkan proyek berdasarkan UserID
router.get('/getProjects', authenticateToken, async (req, res) => {
  if (req.user.Role !== 'ProjectManager') {
    return res.sendStatus(403);
  }

  try {
    const projects = await Project.findAll({
      where: { createdBy: req.user.UserID },
      include: {
        model: MaterialProyek,
        include: [WarehouseMaterial]
      }
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Error fetching projects', details: error.message });
  }
});

// Route untuk menandai proyek sebagai selesai
router.post('/completeProject/:projectID', authenticateToken, async (req, res) => {
  if (req.user.Role !== 'ProjectManager') {
    return res.sendStatus(403);
  }

  const { projectID } = req.params;

  try {
    const project = await Project.findByPk(projectID);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.status = 'Completed';
    await project.save();

    res.status(200).json({ message: 'Project marked as completed', project });
  } catch (error) {
    console.error('Error marking project as completed:', error);
    res.status(500).json({ error: 'Error marking project as completed', details: error.message });
  }
});

export default router;