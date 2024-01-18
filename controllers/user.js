const config = require("../config");
const putSignedUrl = require("../middlewares/putObject");
const { Users } = require("../models");
const { generateErrorInstance } = require("../utils");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {putObjectUrl, uploadFile,} = require("../utils/putObjectUrl");
const{Readable}=require("stream")
module.exports = { 
  signup: async (req, res) => {
    try {
      const uploadedFile = req.file;
  const url= await putObjectUrl(req.file.originalname,req.file.mimetype)
 
  const fileStream= req.file.buffer;
  console.log(fileStream)
 
  const upload= await uploadFile(req.file.originalname,fileStream,req.file.mimetype)
 
      const { name, email, password, instructor } = req.body;
      if (!name || !email || !password || !uploadedFile) {
        throw generateErrorInstance({
          status: 400,
          message: "Required fields can't be empty",
        });
      }
      const existingUser = await Users.findOne({
        where: { email },
      });
      if (existingUser) {
        throw generateErrorInstance({
          status: 409,
          message: "Email already exists!",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await Users.create({
        name,
        email,
        password: hashedPassword,
        profileImage: req.file.originalname,
        role: instructor ? "INSTRUCTOR" : "STUDENT",
      });
      await res.status(200).send(user);
    } catch (err) {
      console.log(err);
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw generateErrorInstance({
          status: 400,
          message: "Required fields can't be empty",
        });
      }

      let user = await Users.findOne({
        where: { email },
      });

      if (!user) {
        throw generateErrorInstance({
          status: 404,
          message: "User not found",
        });
      }
      console.log(user.isactive);
      if (!user.isActive) {
        throw generateErrorInstance({
          status: 400,
          message: "User is not active Contact Admin",
        });
      }

      if (user.status !== "APPROVED") {
        throw generateErrorInstance({
          status: 400,
          message: `${user.name} Contact Admin to Approve your Account`,
        });
      }
      const passwordMatched = await bcrypt.compare(password, user.password);
      if (!passwordMatched) {
        throw generateErrorInstance({
          status: 401,
          message: "Invalid Password",
        });
      }

      user = user.toJSON();
      delete user.password;

      const token = jwt.sign(user, config.jwtSecret, {
        expiresIn: "1d",
      });

      return res.status(200).send({ user, token });
    } catch (err) {
      console.log(err);
      return res
        .status(err.status || 500)
        .send(err.message || "Something went wrong!");
    }
  },
  getUsers: async (req, res) => {
    try {
      const users = await Users.findAll({
        where: {
          role: ["INSTRUCTOR", "STUDENT"],
        },
      });
      res.status(200).send(users);
    } catch (err) {
      console.log(err);
    }
  },
};
