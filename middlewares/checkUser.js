const { jwtSecret } = require("../config");
const { Users } = require("../models");
const jwt = require("jsonwebtoken");

const chcekUser = async function (req, res, next) {
  try {
    const { userId } = req.params;
    const user = await Users.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw generateErrorInstance({ status: 404, message: "User not found!" });
    }
    const token = req.header("Authorization");
    if (!token) {
      throw generateErrorInstance({ status: 401, message: "token is empty!" });
    }
    const decoded = jwt.verify(token, jwtSecret);
    if (!decoded) {
      throw generateErrorInstance({ status: 401, message: "invalid token!" });
    }
    if (decoded.id !== userId) {
      throw generateErrorInstance({
        status: 401,
        message: "unauthorized user!",
      });
    }
    req.user = user;
    next();
  } catch (error) {}
};
module.exports = chcekUser;