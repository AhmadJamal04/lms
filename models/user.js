"use strict";
const moment=require("moment")
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("users", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: "Email address already in use!",
      },
      lowercase: true,
    },
    password: {
      type: DataTypes.STRING,

      min: {
        args: [8],
        msg: "Password must be atleast 8 characters in length",
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    profileImage: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },

    role: {
      type: DataTypes.ENUM("ADMIN", "STUDENT", "INSTRUCTOR"),
    },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      defaultValue: "PENDING",
    },
    gender: {
      type: DataTypes.ENUM("MALE", "FEMALE"),
    },
    passwordResetToken: {
      type: DataTypes.STRING,
    },

    passwordResetTokenExpiry: {
      type: DataTypes.DATE,
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

  User.beforeCreate(async (user) => {
    user.dataValues.createdAt = moment().unix();
    user.dataValues.updatedAt = moment().unix();
  });
  User.beforeUpdate(async (user) => {
    user.dataValues.updatedAt = moment().unix();
  });

  User.associate = function (models) {
    console.log(models);

    User.hasOne(models.UserAddresses, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      as: "address",
    });

    User.belongsToMany(models.Courses, {
      through: models.Enrolements,
      foreignKey: "user_id",
    });
    User.hasMany(models.Grades, { foreignKey: "user_id" });
    User.hasMany(models.Assignments, { foreignKey: "user_id" });
  };
  return User;
};
