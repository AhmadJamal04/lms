const{Router}=require("express");
const roleMiddleware = require("../middlewares/authorizeRoles");
const router= Router();
router.post("/", roleMiddleware("INSTRUCTOR"),)


module.exports=router;