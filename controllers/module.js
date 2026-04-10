const { Modules, Courses } = require("../models");
const moduleService = require("../services/moduleService");

module.exports = {
  newModule: async (req, res, next) => {
    try {
      const { course_id } = req.params;
      const { title } = req.body;
      const course = await Courses.findByPk(course_id);

      moduleService.ensureCourseExists(course);
      const module = await Modules.create({
        title,
        course_id,
      });
      res.status(200).json({
        status: "succes",
        data: module,
      });
    } catch (error) {
      next(error);
    }
  },
  deleteMOdule: async (req, res, next) => {
    try {
      const { module_id } = req.params;
      const module = await Modules.findOne({
        where: { id: module_id },
      });
      console.log(module);
      moduleService.ensureModuleExists(module);
      await Modules.destroy({
        where: { id: module.dataValues.id },
      });
      res.status(200).json({
        status: "success",
        message: "module deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
