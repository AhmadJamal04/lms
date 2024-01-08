"use strict";

module.exports=(sequelize,DataTypes)=>{
    const Lesson = sequelize.define('lessons', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        content_html: {
          type: DataTypes.TEXT,
          allowNull:false
        },
      
        module_id: {
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
      Lesson.beforeCreate(async (lesson) => {
        lesson.dataValues.createdAt = moment().unix();
        lesson.dataValues.updatedAt = moment().unix();
      });
      Lesson.beforeUpdate(async (lesson) => {
        lesson.dataValues.updatedAt = moment().unix();
      });
      Lesson.associate=function(models){
        Lesson.belongsTo(models.Modules);
        Lesson.hasMany(models.Assignments,{
          foreignKey:"lesson_id"
        })
      }
return Lesson;
}

