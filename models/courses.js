"use strict";


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
        description:{
            type: DataTypes.TEXT,
            allowNull: false,
        },
        fk_instructor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
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

    return Course;
}