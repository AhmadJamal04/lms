const { Router } = require("express");
const router = Router();

// Routers
const userRouter = require("./user");
const courseRouter= require("./course")
const enrolementRouter=require("./enrolement")


router.use("/users", userRouter);
router.use("/courses", courseRouter);
router.use("/enrolement", enrolementRouter);

module.exports = router;
