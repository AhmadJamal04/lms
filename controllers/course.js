const { generateErrorInstance } = require("../utils");
const { Courses, Modules, Users, Enrolements, Assignments, Grades } = require("../models");
const { Op } = require("sequelize");

module.exports = {
  // ==================== PUBLIC ROUTES ====================
  
  // Get all public courses (for course discovery)
  getPublicCourses: async (req, res, next) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category, 
        level, 
        sortBy = 'createdAt', 
        sortOrder = 'DESC',
        search 
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = { 
        status: 'PUBLISHED',
        isActive: true 
      };

      // Add filters
      if (category) whereClause.category = category;
      if (level) whereClause.level = level;
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const courses = await Courses.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Users,
            as: 'instructor',
            attributes: ['id', 'name', 'profileImage']
          }
        ],
        attributes: ['id', 'title', 'description', 'course_intro', 'thumbnail', 'price', 'level', 'category', 'rating', 'enrollmentCount', 'createdAt'],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]]
      });

      res.status(200).json({
        success: true,
        data: courses.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(courses.count / limit),
          totalItems: courses.count,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get public course details
  getPublicCourseDetails: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const course = await Courses.findOne({
        where: { 
          id, 
          status: 'PUBLISHED',
          isActive: true 
        },
        include: [
          {
            model: Users,
            as: 'instructor',
            attributes: ['id', 'name', 'profileImage', 'bio']
          },
          {
            model: Modules,
            as: 'modules',
            attributes: ['id', 'title', 'description', 'order']
          }
        ]
      });

      if (!course) {
        throw generateErrorInstance({
          status: 404,
          message: "Course not found"
        });
      }

      res.status(200).json({
        success: true,
        data: course
      });
    } catch (error) {
      next(error);
    }
  },

  // Search courses
  searchCourses: async (req, res, next) => {
    try {
      const { q, category, level, minPrice, maxPrice, sortBy = 'relevance' } = req.query;
      
      const whereClause = { 
        status: 'PUBLISHED',
        isActive: true 
      };

      if (category) whereClause.category = category;
      if (level) whereClause.level = level;
      if (minPrice !== undefined) whereClause.price = { [Op.gte]: minPrice };
      if (maxPrice !== undefined) whereClause.price = { [Op.lte]: maxPrice };
      if (q) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          { tags: { [Op.contains]: [q] } }
        ];
      }

      let orderClause = [];
      if (sortBy === 'relevance' && q) {
        // Custom relevance scoring based on search term
        orderClause = [
          [Op.literal(`CASE WHEN title ILIKE '%${q}%' THEN 1 ELSE 2 END`)],
          ['rating', 'DESC'],
          ['enrollmentCount', 'DESC']
        ];
      } else {
        orderClause = [[sortBy, 'DESC']];
      }

      const courses = await Courses.findAll({
        where: whereClause,
        include: [
          {
            model: Users,
            as: 'instructor',
            attributes: ['id', 'name', 'profileImage']
          }
        ],
        order: orderClause,
        limit: 20
      });

      res.status(200).json({
        success: true,
        data: courses
      });
    } catch (error) {
      next(error);
    }
  },

  // Get course categories
  getCourseCategories: async (req, res, next) => {
    try {
      const categories = await Courses.findAll({
        attributes: ['category'],
        where: { 
          status: 'PUBLISHED',
          isActive: true,
          category: { [Op.not]: null }
        },
        group: ['category'],
        raw: true
      });

      res.status(200).json({
        success: true,
        data: categories.map(cat => cat.category)
      });
    } catch (error) {
      next(error);
    }
  },

  // ==================== STUDENT ROUTES ====================
  // Note: Enrollment routes moved to /enrollment controller

  // ==================== INSTRUCTOR ROUTES ====================

  // Create course
  createCourse: async (req, res, next) => {
    try {
      const instructorId = req.user.id;
      const courseData = {
        ...req.body,
        fk_instructor_id: instructorId,
        status: 'DRAFT',
        isActive: true
      };

      if (req.file) {
        courseData.thumbnail = req.file.location || req.file.path;
      }

      const course = await Courses.create(courseData);

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: course
      });
    } catch (error) {
      next(error);
    }
  },

  // Get instructor's courses
  getInstructorCourses: async (req, res, next) => {
    try {
      const instructorId = req.user.id;
      const { status, page = 1, limit = 10 } = req.query;

      const whereClause = { fk_instructor_id: instructorId };
      if (status) whereClause.status = status;

      const courses = await Courses.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Enrolements,
            as: 'enrollments',
            attributes: ['id', 'status', 'enrolledAt']
          }
        ],
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: courses.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(courses.count / limit),
          totalItems: courses.count
        }
      });
    } catch (error) {
      next(error);
    }
  },

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
