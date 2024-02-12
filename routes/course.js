const { Router } = require("express");
const controller = require("../controllers/course");
const roleMiddleware = require("../middlewares/authorizeRoles");
const checkUser = require("../middlewares/checkUser");

const router = Router();

router.post("/:id",checkUser, roleMiddleware("INSTRUCTOR"), controller.newCourse);
router.patch("/:id/:course_id",checkUser,roleMiddleware("ADMIN","INSTRUCTOR"),controller.updateCourse)
router.get("/:id/:course_id",checkUser,roleMiddleware("INSTRUCTOR"),controller.myCourse)
router.delete("/:id/:course_id",checkUser, roleMiddleware("ADMIN"), controller.deleteCourse);

module.exports = router;
