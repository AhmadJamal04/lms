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
  return Enrolement;
};
