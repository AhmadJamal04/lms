const { Courses, Enrolements } = require("../models");
const { generateErrorInstance } = require("../utils");
module.exports = {
  enrole: async (req, res,next) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      const course = await Courses.findOne({ where: { id: courseId } });
    
      if (!course) {
        throw generateErrorInstance({
          status: 400,
          message: "course not found",
        });
      }

      const enrolement = await Enrolements.create({
        courseId,
        userId,
      });
      console.log(req.params);
      await res.status(200).send(enrolement);
    } catch (error) {
   
      next(error);
    }
  },
};
