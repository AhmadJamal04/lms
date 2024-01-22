const { Router } = require("express");
const controller = require("../controllers/course");
const roleMiddleware = require("../middlewares/authorizeRoles");
const moduleRouter= require("./module")
const router = Router();

router.post("/", roleMiddleware("INSTRUCTOR"), controller.newCourse);

router.delete("/:courseId", roleMiddleware("ADMIN"), controller.deleteCourse);
router.use("/:courseId/module",moduleRouter )
module.exports = router;
