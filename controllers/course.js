const { generateErrorInstance } = require("../utils");
const { Courses } = require("../models");

module.exports = {
  newCourse: async (req, res, next) => {
    try {
      const id = req.user.id;
      const { title, course_intro, description } = req.body;
      const course=await Courses.create({
        title,
        course_intro,
        description,
        fk_instructor_id: id,
      });
      res.status(200).json({
        success:true,
        data:course
      })
    } catch (error) {
      next(error);
    }
  },
  deleteCourse:async(req,res,next)=>{
    try {
        const{courseId}=req.params;
    const course= await Courses.findByPk(courseId)
    if(!course){
        throw generateErrorInstance({
            status:404,
            message:"no course found"
        })
    }
   
  await course.destroy();
    res.status(200).send("course deleted successfully")
    } catch (error) {
        console.log(error);
        next(error);
    }
  }
};
