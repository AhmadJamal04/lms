const { generateErrorInstance } = require("../utils");

module.exports =
  (...roles) =>
  async (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        throw generateErrorInstance({
          status: 400,
          message: `Role ${req.user.role} is not allowed to access this resource or Perform this action `,
        });
      }
      next();
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
