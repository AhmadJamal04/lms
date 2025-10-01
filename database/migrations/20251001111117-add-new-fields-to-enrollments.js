'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add new fields to enrollments table
    await queryInterface.addColumn('enrolements', 'status', {
      type: Sequelize.ENUM('ACTIVE', 'COMPLETED', 'WITHDRAWN', 'SUSPENDED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    });

    await queryInterface.addColumn('enrolements', 'enrolledAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('enrolements', 'completedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('enrolements', 'progress', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00,
    });

    await queryInterface.addColumn('enrolements', 'completedModules', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('enrolements', 'lastAccessed', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove the added columns
    await queryInterface.removeColumn('enrolements', 'status');
    await queryInterface.removeColumn('enrolements', 'enrolledAt');
    await queryInterface.removeColumn('enrolements', 'completedAt');
    await queryInterface.removeColumn('enrolements', 'progress');
    await queryInterface.removeColumn('enrolements', 'completedModules');
    await queryInterface.removeColumn('enrolements', 'lastAccessed');
  }
};
