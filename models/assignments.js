"use strict";



 module.exports=(sequelize,DataTypes)=>{
    const Assignment= sequelize.define("assignments",{
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          title: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          description: {
            type: DataTypes.TEXT,
          },
          deadline: {
            type: DataTypes.DATE,
            allowNull: false,
          },
          status: {
            type: DataTypes.ENUM('pending', 'completed', 'graded'),
            defaultValue: 'pending',
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          lesson_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          course_id: {
            type: DataTypes.INTEGER,
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
    Assignment.beforeCreate(async (assignment) => {
        assignment.dataValues.createdAt = moment().unix();
        assignment.dataValues.updatedAt = moment().unix();
      });
      Assignment.beforeUpdate(async (assignment) => {
        assignment.dataValues.updatedAt = moment().unix();
      });
      Assignment.associate=function(models){
        Assignment.belongsTo(models.Lessons);
        Assignment.belongsTo(models.Users);
        Assignment.belongsTo(models.Courses)
        Assignment.hasMany(models.Grades,{foreignKey:"assignment_id"})
      }

    return Assignment;
 }