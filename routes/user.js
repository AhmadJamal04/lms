const { Router } = require("express");
const router = Router();

// Middlewares

// Controllers
const controller = require("../controllers/user");
const upload = require("../middlewares/uploadFile");

// Routes

router.post("/login", controller.login);
router.post(
  "/signup/:__something",
  upload.single("profileImage"),
  controller.signup
);
router.get("/", controller.getUsers);
module.exports = router;
