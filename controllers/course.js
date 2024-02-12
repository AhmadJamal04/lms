const { generateErrorInstance } = require("../utils");
const { Courses,Modules } = require("../models");
const { where } = require("sequelize");

module.exports = {
  newCourse: async (req, res, next) => {
    try {
      const id = req.user.id;
      const { title, course_intro, description } = req.body;
      const course = await Courses.create({
        title,
        course_intro,
        description,
        fk_instructor_id: id,
      });
      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      next(error);
    }
  },
  deleteCourse: async (req, res, next) => {
    try {
      const { course_id } = req.params;
      const course = await Courses.findByPk(course_id);
      if (!course) {
        throw generateErrorInstance({
          status: 404,
          message: "no course found",
        });
      }
      await course.destroy();
      res.status(200).send("course deleted successfully");
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  updateCourse: async (req, res, next) => {
    try {
      const { title, description } = req.body;
      const { id, course_id } = req.params;
      const course = await Courses.findByPk(course_id);
      if (!course) {
        throw generateErrorInstance({
          status: 404,
          message: "no course found",
        });
      }
      const updatedCourse = await Courses.update(
        {
          title,
          description,
        },
        { where: { fk_instructor_id: id }, individualHooks: true }
      );
      res.status(200).json({
        status: "success",
        data: updatedCourse,
      });
    } catch (error) {
      next(error);
    }
  },
  myCourse:async(req,res,next)=>{
    try {
      const{id,course_id}=req.params;
      let course=await Courses.findOne({
        where:{fk_instructor_id:id,
        id:course_id},
        include : {
          model: Modules,
          as: "modules",
        }
      });
      if (!course) {
        throw generateErrorInstance({
          status:404,
          message:"course not found"
        })
        
      }
      res.send(course)
    } catch (error) {
      next(error)
    }
  }
};
