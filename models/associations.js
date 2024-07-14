import Project from './Proyek.js'
import MaterialProyek from './MaterialProyek.js';
import WarehouseMaterial from './WarehouseMaterial.js';

Project.hasMany(MaterialProyek, { foreignKey: 'projectID' });
MaterialProyek.belongsTo(Project, { foreignKey: 'projectID' });

MaterialProyek.belongsTo(WarehouseMaterial, { foreignKey: 'warehouseMaterialID' });
WarehouseMaterial.hasMany(MaterialProyek, { foreignKey: 'warehouseMaterialID' });