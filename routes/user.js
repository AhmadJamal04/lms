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
//courses Router
const courseRouter = require("./course");

// Routes
router.post(
  "/signup/:__something",
  upload.single("profileImage"),
  controller.signup
);
router.post("/login", controller.login);
router.get("/", controller.getUsers);
// router.post("/forget-Password",constroller.forgetPassword);
// router.post("/rest-pasword/:token",constroller.forgetPassword)
router.get("/logout", controller.logout);
router.patch(
  "/:id/updateStatus/:userId",
  checkUser,
  roleMiddleware("ADMIN"),
  controller.updateStatus
);
router.use("/:id/course", checkUser, courseRouter);

module.exports = router;
