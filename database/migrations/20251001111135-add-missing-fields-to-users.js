'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if columns exist before adding them
    const tableDescription = await queryInterface.describeTable('users');
    
    // Add missing fields to users table only if they don't exist
    if (!tableDescription.isActive) {
      await queryInterface.addColumn('users', 'isActive', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }

    if (!tableDescription.profileImage) {
      await queryInterface.addColumn('users', 'profileImage', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!tableDescription.phone) {
      await queryInterface.addColumn('users', 'phone', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!tableDescription.role) {
      await queryInterface.addColumn('users', 'role', {
        type: Sequelize.ENUM('ADMIN', 'STUDENT', 'INSTRUCTOR'),
        allowNull: true,
      });
    }

    if (!tableDescription.gender) {
      await queryInterface.addColumn('users', 'gender', {
        type: Sequelize.ENUM('MALE', 'FEMALE'),
        allowNull: true,
      });
    }

    // Update existing status enum to match new model
    await queryInterface.changeColumn('users', 'status', {
      type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove the added columns
    await queryInterface.removeColumn('users', 'isActive');
    await queryInterface.removeColumn('users', 'profileImage');
    await queryInterface.removeColumn('users', 'phone');
    await queryInterface.removeColumn('users', 'role');
    await queryInterface.removeColumn('users', 'gender');
    
    // Revert status enum
    await queryInterface.changeColumn('users', 'status', {
      type: Sequelize.ENUM('Pending', 'Approved', 'Rejected'),
      allowNull: false,
      defaultValue: 'Pending',
    });
  }
};
