const { Router } = require("express");
const controller = require("../controllers/course");
const roleMiddleware = require("../middlewares/authorizeRoles");
const checkUser = require("../middlewares/checkUser");
const { authenticateToken } = require("../middlewares/jwtAuth");
const { validateInput, validationSchemas } = require("../middlewares/security");
const { courseImageOptimization } = require("../middlewares/imageOptimization");
const upload = require("../middlewares/uploadFile");
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
// Note: Student-specific course routes will be added as needed

// ==================== INSTRUCTOR ROUTES ====================
// Instructor course management
router.post("/", authenticateToken, roleMiddleware("INSTRUCTOR"), 
  upload.single("courseImage"), 
  courseImageOptimization,
  validateInput(validationSchemas.course),
  controller.createCourse
);

router.get("/instructor/my-courses", authenticateToken, roleMiddleware("INSTRUCTOR"), controller.getInstructorCourses);
// Note: Additional instructor routes will be added as controller methods are implemented

// Note: Course content management, assignments, announcements, and analytics routes
// will be added as the corresponding controller methods are implemented

// ==================== ADMIN ROUTES ====================
// Note: Admin routes will be added as the corresponding controller methods are implemented

module.exports = router;