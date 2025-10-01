'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add new fields to courses table
    await queryInterface.addColumn('courses', 'thumbnail', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
    });

    await queryInterface.addColumn('courses', 'level', {
      type: Sequelize.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'category', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'tags', {
      type: Sequelize.JSON,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'prerequisites', {
      type: Sequelize.JSON,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'duration', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'language', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'English',
    });

    await queryInterface.addColumn('courses', 'status', {
      type: Sequelize.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'DRAFT',
    });

    await queryInterface.addColumn('courses', 'isActive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn('courses', 'rating', {
      type: Sequelize.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: 0.00,
    });

    await queryInterface.addColumn('courses', 'enrollmentCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove the added columns
    await queryInterface.removeColumn('courses', 'thumbnail');
    await queryInterface.removeColumn('courses', 'price');
    await queryInterface.removeColumn('courses', 'level');
    await queryInterface.removeColumn('courses', 'category');
    await queryInterface.removeColumn('courses', 'tags');
    await queryInterface.removeColumn('courses', 'prerequisites');
    await queryInterface.removeColumn('courses', 'duration');
    await queryInterface.removeColumn('courses', 'language');
    await queryInterface.removeColumn('courses', 'status');
    await queryInterface.removeColumn('courses', 'isActive');
    await queryInterface.removeColumn('courses', 'rating');
    await queryInterface.removeColumn('courses', 'enrollmentCount');
  }
};
