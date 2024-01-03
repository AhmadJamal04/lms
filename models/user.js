"use strict";

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
      type: DataTypes.ENUM("ADMIN", "USER", "VENDOR"),
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
  return User;
};
