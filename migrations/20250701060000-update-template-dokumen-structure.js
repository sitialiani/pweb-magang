'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing columns to existing table
    try {
      await queryInterface.addColumn('template_dokumen', 'nama', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      console.log('Column nama might already exist');
    }

    try {
      await queryInterface.addColumn('template_dokumen', 'file_name', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      console.log('Column file_name might already exist');
    }

    try {
      await queryInterface.addColumn('template_dokumen', 'file_size', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    } catch (error) {
      console.log('Column file_size might already exist');
    }

    try {
      await queryInterface.addColumn('template_dokumen', 'file_type', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      console.log('Column file_type might already exist');
    }

    try {
      await queryInterface.addColumn('template_dokumen', 'status', {
        type: Sequelize.ENUM('aktif', 'nonaktif'),
        defaultValue: 'aktif'
      });
    } catch (error) {
      console.log('Column status might already exist');
    }

    try {
      await queryInterface.addColumn('template_dokumen', 'created_by', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    } catch (error) {
      console.log('Column created_by might already exist');
    }

    try {
      await queryInterface.addColumn('template_dokumen', 'updated_by', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    } catch (error) {
      console.log('Column updated_by might already exist');
    }

    try {
      await queryInterface.addColumn('template_dokumen', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    } catch (error) {
      console.log('Column created_at might already exist');
    }

    try {
      await queryInterface.addColumn('template_dokumen', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      });
    } catch (error) {
      console.log('Column updated_at might already exist');
    }

    // Copy data from nama_template to nama if nama is empty
    await queryInterface.sequelize.query(`
      UPDATE template_dokumen 
      SET nama = nama_template 
      WHERE nama IS NULL OR nama = ''
    `);

    // Copy data from file_path to file_name if file_name is empty
    await queryInterface.sequelize.query(`
      UPDATE template_dokumen 
      SET file_name = SUBSTRING_INDEX(file_path, '/', -1)
      WHERE file_name IS NULL OR file_name = ''
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove added columns
    const columns = ['nama', 'file_name', 'file_size', 'file_type', 'status', 'created_by', 'updated_by', 'created_at', 'updated_at'];
    
    for (const column of columns) {
      try {
        await queryInterface.removeColumn('template_dokumen', column);
      } catch (error) {
        console.log(`Column ${column} might not exist`);
      }
    }
  }
}; 