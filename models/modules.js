"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports=(sequelize,DataTypes)=>{
    const Module= sequelize.define("modules",{
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          title: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          course_id: {
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
    })
    Module.beforeCreate(async (module) => {
        module.dataValues.createdAt = moment().unix();
        module.dataValues.updatedAt = moment().unix();
      });
      Module.beforeUpdate(async (module) => {
        module.dataValues.updatedAt = moment().unix();
      });

    return Module
}