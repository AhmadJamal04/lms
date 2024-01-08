"use strict";

module.exports=(sequelize,DataTypes)=>{
    const Grade= sequelize.define("grades",{
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          score: {
            type: DataTypes.FLOAT, // Assuming grades can be decimal values
            allowNull: false,
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          assignment_id: {
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
    Grade.beforeCreate(async (grade) => {
        grade.dataValues.createdAt = moment().unix();
        grade.dataValues.updatedAt = moment().unix();
      });
      Grade.beforeUpdate(async (grade) => {
        grade.dataValues.updatedAt = moment().unix();
      });
      Grade.associate=function(models){
        Grade.belongsTo(models.Assignments);
        Grade.belongsTo(models.Users)
      }
    return Grade;
}