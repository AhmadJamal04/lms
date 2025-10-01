const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  const Enrolement = sequelize.define("enrolements", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'WITHDRAWN', 'SUSPENDED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    enrolledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    progress: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    completedModules: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastAccessed: {
      type: DataTypes.DATE,
      allowNull: true,
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
  Enrolement.beforeCreate(async (enrolement) => {
    enrolement.dataValues.createdAt = moment().unix();
    enrolement.dataValues.updatedAt = moment().unix();
  });
  Enrolement.beforeUpdate(async (enrolement) => {
    enrolement.dataValues.updatedAt = moment().unix();
  });

  Enrolement.associate = function (models) {
    // Enrollment belongs to user (student)
    Enrolement.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "student"
    });

    // Enrollment belongs to course
    Enrolement.belongsTo(models.Courses, {
      foreignKey: "course_id",
      as: "course"
    });
  };

  return Enrolement;
};
