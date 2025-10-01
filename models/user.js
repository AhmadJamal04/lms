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
    resetPasswordToken: {
      type: DataTypes.STRING,
    },

    resetPasswordTokenExpiry: {
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
  }, {
    timestamps: false, // Disable automatic timestamp management
  });

  User.beforeCreate(async (user) => {
    const now = moment().unix();
    user.dataValues.createdAt = now;
    user.dataValues.updatedAt = now;
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

    // User has many courses as instructor
    User.hasMany(models.Courses, {
      foreignKey: "fk_instructor_id",
      as: "courses"
    });

    // User has many courses as student through enrollments
    User.belongsToMany(models.Courses, {
      through: models.Enrolements,
      foreignKey: "user_id",
      otherKey: "course_id",
      as: "enrolledCourses"
    });

    // User has many enrollments
    User.hasMany(models.Enrolements, {
      foreignKey: "user_id",
      as: "enrollments"
    });
    User.hasMany(models.Grades, { foreignKey: "user_id" });
    User.hasMany(models.Assignments, { foreignKey: "user_id" });
  };
  return User;
};
