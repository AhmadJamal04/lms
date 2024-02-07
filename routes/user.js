const { Router } = require("express");
const router = Router();

// Middlewares
const multer = require("multer");
const storage = multer.memoryStorage();
const roleMiddleware = require("../middlewares/authorizeRoles");
const upload = multer({ storage });
const checkUser = require("../middlewares/checkUser");
// Controllers
const controller = require("../controllers/user");

// Routes
router.post(
  "/signup/:__something",
  upload.single("profileImage"),
  controller.signup
);
router.post("/login", controller.login);
router.post("/getPresignedUrl", controller.preSignedUrl);
router.get("/", controller.getUsers);
router.post("/forget-Password", controller.forgetPassword);
// router.post("/rest-pasword/:token",controller.resetPassword)
router.get("/logout", controller.logout);
router.patch(
  "/:id/updateStatus/:userId",
  checkUser,
  roleMiddleware("ADMIN"),
  controller.updateStatus
);

module.exports = router;
