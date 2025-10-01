const { Router } = require("express");
const controller = require("../controllers/course");
const roleMiddleware = require("../middlewares/authorizeRoles");
const checkUser = require("../middlewares/checkUser");
const { authenticateToken } = require("../middlewares/jwtAuth");
const { validateInput, validationSchemas } = require("../middlewares/security");
const { courseImageOptimization } = require("../middlewares/imageOptimization");
const { upload } = require("../middlewares/uploadFile");
const { generalRateLimit } = require("../middlewares/security");

const router = Router();

// ==================== PUBLIC ROUTES ====================
// Course discovery for students (no auth required)
router.get("/public", generalRateLimit, controller.getPublicCourses);
router.get("/public/:id", generalRateLimit, controller.getPublicCourseDetails);
router.get("/public/search", generalRateLimit, controller.searchCourses);
router.get("/public/categories", generalRateLimit, controller.getCourseCategories);

// ==================== STUDENT ROUTES ====================
// Student course management (enrollment routes moved to /enrollment)
router.get("/:id", authenticateToken, roleMiddleware("STUDENT"), controller.getCourseDetails);
router.get("/:id/assignments", authenticateToken, roleMiddleware("STUDENT"), controller.getCourseAssignments);
router.get("/:id/announcements", authenticateToken, roleMiddleware("STUDENT"), controller.getCourseAnnouncements);

// ==================== INSTRUCTOR ROUTES ====================
// Instructor course management
router.post("/", authenticateToken, roleMiddleware("INSTRUCTOR"), 
  upload.single("courseImage"), 
  courseImageOptimization,
  validateInput(validationSchemas.course),
  controller.createCourse
);

router.get("/instructor/my-courses", authenticateToken, roleMiddleware("INSTRUCTOR"), controller.getInstructorCourses);
router.get("/instructor/:id", authenticateToken, roleMiddleware("INSTRUCTOR"), controller.getInstructorCourseDetails);
router.patch("/:id", authenticateToken, roleMiddleware("INSTRUCTOR"), 
  upload.single("courseImage"),
  courseImageOptimization,
  validateInput(validationSchemas.courseUpdate),
  controller.updateCourse
);

router.delete("/:id", authenticateToken, roleMiddleware("INSTRUCTOR"), controller.deleteCourse);

// Course content management
router.post("/:id/modules", authenticateToken, roleMiddleware("INSTRUCTOR"), 
  validateInput(validationSchemas.module),
  controller.createModule
);
router.patch("/:id/modules/:moduleId", authenticateToken, roleMiddleware("INSTRUCTOR"), 
  validateInput(validationSchemas.moduleUpdate),
  controller.updateModule
);
router.delete("/:id/modules/:moduleId", authenticateToken, roleMiddleware("INSTRUCTOR"), controller.deleteModule);

// Course assignments
router.post("/:id/assignments", authenticateToken, roleMiddleware("INSTRUCTOR"), 
  validateInput(validationSchemas.assignment),
  controller.createAssignment
);
router.patch("/:id/assignments/:assignmentId", authenticateToken, roleMiddleware("INSTRUCTOR"), 
  validateInput(validationSchemas.assignmentUpdate),
  controller.updateAssignment
);
router.delete("/:id/assignments/:assignmentId", authenticateToken, roleMiddleware("INSTRUCTOR"), controller.deleteAssignment);

// Course announcements
router.post("/:id/announcements", authenticateToken, roleMiddleware("INSTRUCTOR"), 
  validateInput(validationSchemas.announcement),
  controller.createAnnouncement
);
router.patch("/:id/announcements/:announcementId", authenticateToken, roleMiddleware("INSTRUCTOR"), 
  validateInput(validationSchemas.announcementUpdate),
  controller.updateAnnouncement
);
router.delete("/:id/announcements/:announcementId", authenticateToken, roleMiddleware("INSTRUCTOR"), controller.deleteAnnouncement);

// Course analytics
router.get("/:id/analytics", authenticateToken, roleMiddleware("INSTRUCTOR"), controller.getCourseAnalytics);
router.get("/:id/students", authenticateToken, roleMiddleware("INSTRUCTOR"), controller.getCourseStudents);
router.get("/:id/enrollment-stats", authenticateToken, roleMiddleware("INSTRUCTOR"), controller.getEnrollmentStats);

// ==================== ADMIN ROUTES ====================
// Admin course management
router.get("/admin/all", authenticateToken, roleMiddleware("ADMIN"), controller.getAllCourses);
router.get("/admin/:id", authenticateToken, roleMiddleware("ADMIN"), controller.getAdminCourseDetails);
router.patch("/admin/:id/status", authenticateToken, roleMiddleware("ADMIN"), 
  validateInput(validationSchemas.courseStatusUpdate),
  controller.updateCourseStatus
);
router.delete("/admin/:id", authenticateToken, roleMiddleware("ADMIN"), controller.adminDeleteCourse);

// Course categories management
router.post("/admin/categories", authenticateToken, roleMiddleware("ADMIN"), 
  validateInput(validationSchemas.category),
  controller.createCategory
);
router.patch("/admin/categories/:categoryId", authenticateToken, roleMiddleware("ADMIN"), 
  validateInput(validationSchemas.categoryUpdate),
  controller.updateCategory
);
router.delete("/admin/categories/:categoryId", authenticateToken, roleMiddleware("ADMIN"), controller.deleteCategory);

// System analytics
router.get("/admin/analytics/overview", authenticateToken, roleMiddleware("ADMIN"), controller.getSystemAnalytics);
router.get("/admin/analytics/courses", authenticateToken, roleMiddleware("ADMIN"), controller.getCourseAnalytics);
router.get("/admin/analytics/instructors", authenticateToken, roleMiddleware("ADMIN"), controller.getInstructorAnalytics);

module.exports = router;