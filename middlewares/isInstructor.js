const { Users } = require("../models");
const isInstructor = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await Users.findOne({
      where: { id: userId },
      attributes: ["role"],
    });

    req.user = user.dataValues;
  } catch (error) {
    console.log(error);
    next(error);
  }
};
module.exports = isInstructor;
