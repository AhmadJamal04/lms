const { Router } = require("express");
const router = Router();

// Routers
const userRouter = require("./user");
const courseRouter = require("./course");
const enrolementRouter = require("./enrolement");
const moduleRouter = require("./module");

router.use("/users", userRouter);
router.use("/courses", courseRouter);
router.use("/enrolements", enrolementRouter);
router.use("/modules", moduleRouter);

module.exports = router;
