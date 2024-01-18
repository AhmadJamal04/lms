const { Router } = require("express");
const router = Router();

// Middlewares

// Controllers
const controller = require("../controllers/user");
// const upload = require("../middlewares/uploadFile");
const putSignedUrl = require("../middlewares/putObject");
const multer = require("multer");
const storage=multer.memoryStorage()
const upload= multer({storage})
// Routes
router.post(
  "/signup/:__something",
  upload.single("profileImage"),
  controller.signup
);
router.post("/login", controller.login);
router.get("/", controller.getUsers);
module.exports = router;
