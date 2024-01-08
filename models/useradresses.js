module.exports = (sequelize, DataTypes) => {
  const UserAddress = sequelize.define("userAddresses", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    street: {
      type: DataTypes.STRING,
    },
    zipCode: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    houseNumber: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    user_id: {
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
  UserAddress.beforeCreate(async (userAdress) => {
    userAdress.dataValues.createdAt = moment().unix();
    userAdress.dataValues.updatedAt = moment().unix();
  });
  UserAddress.beforeUpdate(async (userAdress) => {
    userAdress.dataValues.updatedAt = moment().unix();
  });

  UserAddress.associate = function (models) {
    UserAddress.belongsTo(models.Users, {
      foreignKey: "user_id",
      onDelete: 'CASCADE', onUpdate: 'CASCADE'
    });
  };

  return UserAddress;
};
