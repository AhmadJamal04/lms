const { Router } = require("express");
const router = Router();

// Middlewares
const multer = require("multer");
const storage = multer.memoryStorage();
const roleMiddleware = require("../middlewares/authorizeRoles");
const upload = multer({ storage });
const { roles } = require("../config");


// Enhanced security and performance middlewares
const { validateInput, validationSchemas } = require("../middlewares/security");
const { profileImageOptimization } = require("../middlewares/imageOptimization");
const { authenticateToken, refreshToken, logout } = require("../middlewares/jwtAuth");

// Controllers
const controller = require("../controllers/user");

// Routes with enhanced security and validation
router.post(
  "/signup",
  upload.single("profileImage"),
  profileImageOptimization,
  validateInput(validationSchemas.signup),
  controller.signup
);

router.post(
  "/login",
  validateInput(validationSchemas.login),
  controller.login
);

router.post(
  "/refresh-token",
  refreshToken
);

router.post(
  "/logout",
  authenticateToken,
  logout
);

router.post(
  "/getPresignedUrl",
  authenticateToken,
  controller.preSignedUrl
);

router.get(
  "/",
  authenticateToken,
  controller.getUsers
);

router.post(
  "/forgetPassword",
  validateInput(validationSchemas.login), // Reuse login validation for email
  controller.forgetPassword
);

router.post(
  "/reset-password/:token",
  validateInput(validationSchemas.passwordReset),
  controller.resetPassword
);

router.patch(
  "/:id/updateStatus/:userId",
  authenticateToken,
  roleMiddleware(roles.admin),
  controller.updateStatus
);

// Admin signup endpoint (for creating additional admins)
router.post(
  "/admin-signup",
  upload.single("profileImage"),
  profileImageOptimization,
  validateInput(validationSchemas.signup),
  controller.adminSignup
);

module.exports = router;
