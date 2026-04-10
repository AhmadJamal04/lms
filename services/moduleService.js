const { generateErrorInstance } = require("../utils");

const ensureCourseExists = (course) => {
  if (!course) {
    throw generateErrorInstance({
      status: 404,
      message: "course not found",
    });
  }
};

const ensureModuleExists = (module) => {
  if (!module) {
    throw generateErrorInstance({
      status: 404,
      message: "module not found",
    });
  }
};

module.exports = {
  ensureCourseExists,
  ensureModuleExists,
};
