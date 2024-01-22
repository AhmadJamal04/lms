const { jwtSecret } = require("../config");
const { Users } = require("../models");
const jwt = require("jsonwebtoken");
const { generateErrorInstance } = require("../utils");

const checkUser = async function (req, res, next) {
  try {
    const { id} = req.params;

    const user = await Users.findOne({
      where: { id: id },
    });

    if (!user) {
      throw generateErrorInstance({ status: 404, message: "User not found!" });
    }
    const token = req.header("Authorization");
    if (!token) {
      throw generateErrorInstance({ status: 401, message: "token is empty!" });
    }
    const OnlyToken = token.split(" ")[1];
    const decoded = jwt.verify(OnlyToken, jwtSecret);
    if (!decoded) {
      throw generateErrorInstance({ status: 401, message: "invalid token!" });
    }

    if (decoded.id != id) {
      throw generateErrorInstance({
        status: 401,
        message: "unauthorized user!",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
module.exports = checkUser;
