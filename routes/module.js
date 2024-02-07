const{Router}=require("express");
const roleMiddleware = require("../middlewares/authorizeRoles");
const checkUser = require("../middlewares/checkUser");
const router= Router();

const controller= require("../controllers/module")
router.post("/:id/:course_id",checkUser, roleMiddleware("INSTRUCTOR"),controller.newModule)
router.delete("/:id/:module_id",checkUser,roleMiddleware("INSTRUCTOR"),controller.deleteMOdule)


module.exports=router;