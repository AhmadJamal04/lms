const { Router } = require("express");
const controller = require("../controllers/enrollment");
const { authenticateToken } = require("../middlewares/jwtAuth");
const { roleMiddleware } = require("../middlewares/authorizeRoles");
const { validateInput, validationSchemas } = require("../middlewares/security");
const { generalRateLimit } = require("../middlewares/security");

const router = Router();

// ==================== STUDENT ROUTES ====================
// Student enrollment management
router.get("/", authenticateToken, roleMiddleware("STUDENT"), controller.getStudentEnrollments);
router.get("/my-courses", authenticateToken, roleMiddleware("STUDENT"), controller.getMyCourses);
router.get("/:id", authenticateToken, roleMiddleware("STUDENT"), controller.getEnrollmentDetails);
router.post("/:courseId/enroll", authenticateToken, roleMiddleware("STUDENT"), controller.enrollInCourse);
router.post("/:courseId/unenroll", authenticateToken, roleMiddleware("STUDENT"), controller.unenrollFromCourse);
router.get("/:id/progress", authenticateToken, roleMiddleware("STUDENT"), controller.getCourseProgress);
router.patch("/:id/progress", authenticateToken, roleMiddleware("STUDENT"), 
  validateInput(validationSchemas.progressUpdate),
  controller.updateProgress
);

// ==================== INSTRUCTOR ROUTES ====================
// Instructor enrollment management
router.get("/instructor/:courseId/students", authenticateToken, roleMiddleware("INSTRUCTOR"), controller.getCourseStudents);
router.get("/instructor/:courseId/analytics", authenticateToken, roleMiddleware("INSTRUCTOR"), controller.getEnrollmentAnalytics);
router.patch("/instructor/:id/status", authenticateToken, roleMiddleware("INSTRUCTOR"), 
  validateInput(validationSchemas.enrollmentStatusUpdate),
  controller.updateEnrollmentStatus
);

// ==================== ADMIN ROUTES ====================
// Admin enrollment management
router.get("/admin/all", authenticateToken, roleMiddleware("ADMIN"), controller.getAllEnrollments);
router.get("/admin/analytics", authenticateToken, roleMiddleware("ADMIN"), controller.getSystemEnrollmentAnalytics);
router.patch("/admin/:id/status", authenticateToken, roleMiddleware("ADMIN"), 
  validateInput(validationSchemas.enrollmentStatusUpdate),
  controller.adminUpdateEnrollmentStatus
);

module.exports = router;
