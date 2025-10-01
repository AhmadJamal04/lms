const { generateErrorInstance } = require("../utils");
const { Enrolements, Courses, Users, Modules, Assignments, Grades } = require("../models");
const { Op } = require("sequelize");

module.exports = {
  // ==================== STUDENT ROUTES ====================

  // Get student's enrollments
  getStudentEnrollments: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { status = 'ACTIVE', page = 1, limit = 10 } = req.query;

      const whereClause = { userId };
      if (status !== 'ALL') {
        whereClause.status = status;
      }

      const enrollments = await Enrolements.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Courses,
            as: 'course',
            include: [
              {
                model: Users,
                as: 'instructor',
                attributes: ['id', 'name', 'profileImage']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['enrolledAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: enrollments.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(enrollments.count / limit),
          totalItems: enrollments.count
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get student's courses (simplified view)
  getMyCourses: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { status = 'ACTIVE' } = req.query;

      const whereClause = { userId };
      if (status !== 'ALL') {
        whereClause.status = status;
      }

      const enrollments = await Enrolements.findAll({
        where: whereClause,
        include: [
          {
            model: Courses,
            as: 'course',
            attributes: ['id', 'title', 'description', 'thumbnail', 'level', 'category'],
            include: [
              {
                model: Users,
                as: 'instructor',
                attributes: ['id', 'name', 'profileImage']
              }
            ]
          }
        ],
        order: [['lastAccessed', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: enrollments
      });
    } catch (error) {
      next(error);
    }
  },

  // Get enrollment details
  getEnrollmentDetails: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const enrollment = await Enrolements.findOne({
        where: { id, userId },
        include: [
          {
            model: Courses,
            as: 'course',
            include: [
              {
                model: Users,
                as: 'instructor',
                attributes: ['id', 'name', 'profileImage', 'bio']
              },
              {
                model: Modules,
                as: 'modules',
                order: [['order', 'ASC']]
              }
            ]
          }
        ]
      });

      if (!enrollment) {
        throw generateErrorInstance({
          status: 404,
          message: "Enrollment not found"
        });
      }

      res.status(200).json({
        success: true,
        data: enrollment
      });
    } catch (error) {
      next(error);
    }
  },

  // Enroll in course
  enrollInCourse: async (req, res, next) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      // Check if course exists and is published
      const course = await Courses.findOne({
        where: { id: courseId, status: 'PUBLISHED', isActive: true }
      });

      if (!course) {
        throw generateErrorInstance({
          status: 404,
          message: "Course not found or not available for enrollment"
        });
      }

      // Check if already enrolled
      const existingEnrollment = await Enrolements.findOne({
        where: { userId, courseId }
      });

      if (existingEnrollment) {
        if (existingEnrollment.status === 'ACTIVE') {
          throw generateErrorInstance({
            status: 400,
            message: "You are already enrolled in this course"
          });
        } else if (existingEnrollment.status === 'WITHDRAWN') {
          // Reactivate enrollment
          await existingEnrollment.update({
            status: 'ACTIVE',
            enrolledAt: new Date(),
            lastAccessed: new Date()
          });

          return res.status(200).json({
            success: true,
            message: "Successfully re-enrolled in course",
            data: existingEnrollment
          });
        }
      }

      // Create new enrollment
      const enrollment = await Enrolements.create({
        userId,
        courseId,
        status: 'ACTIVE',
        enrolledAt: new Date(),
        lastAccessed: new Date()
      });

      // Update course enrollment count
      await course.increment('enrollmentCount');

      res.status(201).json({
        success: true,
        message: "Successfully enrolled in course",
        data: enrollment
      });
    } catch (error) {
      next(error);
    }
  },

  // Unenroll from course
  unenrollFromCourse: async (req, res, next) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      const enrollment = await Enrolements.findOne({
        where: { userId, courseId, status: 'ACTIVE' }
      });

      if (!enrollment) {
        throw generateErrorInstance({
          status: 404,
          message: "You are not enrolled in this course"
        });
      }

      await enrollment.update({ 
        status: 'WITHDRAWN',
        completedAt: new Date()
      });

      // Update course enrollment count
      const course = await Courses.findByPk(courseId);
      if (course && course.enrollmentCount > 0) {
        await course.decrement('enrollmentCount');
      }

      res.status(200).json({
        success: true,
        message: "Successfully unenrolled from course"
      });
    } catch (error) {
      next(error);
    }
  },

  // Get course progress
  getCourseProgress: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const enrollment = await Enrolements.findOne({
        where: { id, userId },
        include: [
          {
            model: Courses,
            as: 'course',
            include: [
              {
                model: Modules,
                as: 'modules'
              }
            ]
          }
        ]
      });

      if (!enrollment) {
        throw generateErrorInstance({
          status: 404,
          message: "Enrollment not found"
        });
      }

      // Calculate progress
      const totalModules = enrollment.course.modules.length;
      const completedModules = enrollment.completedModules || 0;
      const progress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

      res.status(200).json({
        success: true,
        data: {
          enrollmentId: id,
          courseId: enrollment.courseId,
          progress: Math.round(progress),
          completedModules,
          totalModules,
          lastAccessed: enrollment.lastAccessed,
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Update progress
  updateProgress: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { completedModules, lastAccessed } = req.body;

      const enrollment = await Enrolements.findOne({
        where: { id, userId }
      });

      if (!enrollment) {
        throw generateErrorInstance({
          status: 404,
          message: "Enrollment not found"
        });
      }

      const updateData = {};
      if (completedModules !== undefined) {
        updateData.completedModules = completedModules;
        
        // Calculate progress percentage
        const course = await Courses.findByPk(enrollment.courseId, {
          include: [{ model: Modules, as: 'modules' }]
        });
        
        if (course && course.modules.length > 0) {
          updateData.progress = (completedModules / course.modules.length) * 100;
          
          // Mark as completed if all modules are done
          if (completedModules >= course.modules.length) {
            updateData.status = 'COMPLETED';
            updateData.completedAt = new Date();
          }
        }
      }

      if (lastAccessed) {
        updateData.lastAccessed = new Date(lastAccessed);
      }

      await enrollment.update(updateData);

      res.status(200).json({
        success: true,
        message: "Progress updated successfully",
        data: enrollment
      });
    } catch (error) {
      next(error);
    }
  },

  // ==================== INSTRUCTOR ROUTES ====================

  // Get course students
  getCourseStudents: async (req, res, next) => {
    try {
      const { courseId } = req.params;
      const instructorId = req.user.id;

      // Verify course ownership
      const course = await Courses.findOne({
        where: { id: courseId, fk_instructor_id: instructorId }
      });

      if (!course) {
        throw generateErrorInstance({
          status: 404,
          message: "Course not found"
        });
      }

      const students = await Enrolements.findAll({
        where: { courseId },
        include: [
          {
            model: Users,
            as: 'student',
            attributes: ['id', 'name', 'email', 'profileImage']
          }
        ],
        order: [['enrolledAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: students
      });
    } catch (error) {
      next(error);
    }
  },

  // Get enrollment analytics for course
  getEnrollmentAnalytics: async (req, res, next) => {
    try {
      const { courseId } = req.params;
      const instructorId = req.user.id;

      // Verify course ownership
      const course = await Courses.findOne({
        where: { id: courseId, fk_instructor_id: instructorId }
      });

      if (!course) {
        throw generateErrorInstance({
          status: 404,
          message: "Course not found"
        });
      }

      // Get enrollment stats by status
      const enrollmentStats = await Enrolements.findAll({
        where: { courseId },
        attributes: [
          'status',
          [Enrolements.sequelize.fn('COUNT', Enrolements.sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      // Get progress distribution
      const progressStats = await Enrolements.findAll({
        where: { courseId, status: 'ACTIVE' },
        attributes: [
          [Enrolements.sequelize.fn('AVG', Enrolements.sequelize.col('progress')), 'avgProgress'],
          [Enrolements.sequelize.fn('MAX', Enrolements.sequelize.col('progress')), 'maxProgress'],
          [Enrolements.sequelize.fn('MIN', Enrolements.sequelize.col('progress')), 'minProgress']
        ],
        raw: true
      });

      res.status(200).json({
        success: true,
        data: {
          enrollmentStats,
          progressStats: progressStats[0] || {},
          totalEnrollments: enrollmentStats.reduce((sum, stat) => sum + parseInt(stat.dataValues.count), 0)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Update enrollment status (Instructor)
  updateEnrollmentStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const enrollment = await Enrolements.findByPk(id, {
        include: [
          {
            model: Courses,
            as: 'course',
            attributes: ['id', 'fk_instructor_id']
          }
        ]
      });

      if (!enrollment) {
        throw generateErrorInstance({
          status: 404,
          message: "Enrollment not found"
        });
      }

      // Verify instructor owns the course
      if (enrollment.course.fk_instructor_id !== req.user.id) {
        throw generateErrorInstance({
          status: 403,
          message: "You don't have permission to modify this enrollment"
        });
      }

      await enrollment.update({ status });

      res.status(200).json({
        success: true,
        message: "Enrollment status updated successfully",
        data: enrollment
      });
    } catch (error) {
      next(error);
    }
  },

  // ==================== ADMIN ROUTES ====================

  // Get all enrollments (Admin)
  getAllEnrollments: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, status, courseId, userId } = req.query;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (courseId) whereClause.courseId = courseId;
      if (userId) whereClause.userId = userId;

      const enrollments = await Enrolements.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Users,
            as: 'student',
            attributes: ['id', 'name', 'email', 'profileImage']
          },
          {
            model: Courses,
            as: 'course',
            attributes: ['id', 'title', 'category', 'level'],
            include: [
              {
                model: Users,
                as: 'instructor',
                attributes: ['id', 'name']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['enrolledAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: enrollments.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(enrollments.count / limit),
          totalItems: enrollments.count
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get system enrollment analytics
  getSystemEnrollmentAnalytics: async (req, res, next) => {
    try {
      const { period = '30' } = req.query; // days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      // Get enrollment trends
      const enrollmentTrends = await Enrolements.findAll({
        where: {
          enrolledAt: {
            [Op.gte]: startDate
          }
        },
        attributes: [
          [Enrolements.sequelize.fn('DATE', Enrolements.sequelize.col('enrolledAt')), 'date'],
          [Enrolements.sequelize.fn('COUNT', Enrolements.sequelize.col('id')), 'count']
        ],
        group: [Enrolements.sequelize.fn('DATE', Enrolements.sequelize.col('enrolledAt'))],
        order: [[Enrolements.sequelize.fn('DATE', Enrolements.sequelize.col('enrolledAt')), 'ASC']]
      });

      // Get status distribution
      const statusDistribution = await Enrolements.findAll({
        attributes: [
          'status',
          [Enrolements.sequelize.fn('COUNT', Enrolements.sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      // Get completion rate
      const completionStats = await Enrolements.findAll({
        attributes: [
          [Enrolements.sequelize.fn('COUNT', Enrolements.sequelize.col('id')), 'totalEnrollments'],
          [Enrolements.sequelize.fn('COUNT', Enrolements.sequelize.literal('CASE WHEN status = "COMPLETED" THEN 1 END')), 'completedEnrollments']
        ],
        raw: true
      });

      res.status(200).json({
        success: true,
        data: {
          enrollmentTrends,
          statusDistribution,
          completionStats: completionStats[0] || {},
          period: parseInt(period)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin update enrollment status
  adminUpdateEnrollmentStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const enrollment = await Enrolements.findByPk(id);

      if (!enrollment) {
        throw generateErrorInstance({
          status: 404,
          message: "Enrollment not found"
        });
      }

      await enrollment.update({ status });

      res.status(200).json({
        success: true,
        message: "Enrollment status updated successfully",
        data: enrollment
      });
    } catch (error) {
      next(error);
    }
  }
};
