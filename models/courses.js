"use strict";

const moment = require("moment");
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define("courses", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    course_intro: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fk_instructor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
    },
    level: {
      type: DataTypes.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    prerequisites: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER, // in hours
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'English',
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'DRAFT',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: 0.00,
    },
    enrollmentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
  });
  Course.beforeCreate(async (course) => {
    course.dataValues.createdAt = moment().unix();
    course.dataValues.updatedAt = moment().unix();
  });
  Course.beforeUpdate(async (course) => {
    course.dataValues.updatedAt = moment().unix();
  });

  Course.associate = function (models) {
    // Course belongs to instructor
    Course.belongsTo(models.Users, {
      foreignKey: "fk_instructor_id",
      as: "instructor"
    });

    // Course has many students through enrollments
    Course.belongsToMany(models.Users, {
      through: models.Enrolements,
      foreignKey: "course_id",
      otherKey: "user_id",
      as: "students"
    });

    // Course has many enrollments
    Course.hasMany(models.Enrolements, {
      foreignKey: "course_id",
      as: "enrollments"
    });

    // Course has many modules
    Course.hasMany(models.Modules, {
      foreignKey: "course_id",
      onDelete: "CASCADE",
      as: "modules"
    });

    // Course has many assignments
    Course.hasMany(models.Assignments, { 
      foreignKey: "course_id",
      as: "assignments"
    });
  };

  return Course;
};
