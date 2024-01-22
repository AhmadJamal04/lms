const { Router } = require("express");
const router = Router();
const checkUser = require("../middlewares/checkUser");
const constroller = require("../controllers/enrolement");

router.post("/:id/:courseId", checkUser, constroller.enrole);

module.exports = router;
