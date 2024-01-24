const config = require("../config");
const putSignedUrl = require("../middlewares/putObject");
const { Users } = require("../models");
const { generateErrorInstance } = require("../utils");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { putObjectUrl, uploadFile } = require("../utils/putObjectUrl");
const { Readable } = require("stream");
const { Console } = require("console");
module.exports = {
  signup: async (req, res) => {
    try {
      const { name, email, password, instructor } = req.body;
      if (!name || !email || !password) {
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
      const uploadedFile = req.file;

      if (uploadedFile) {
        const fileStream = uploadedFile.buffer;
        const upload = await uploadFile(
          uploadedFile.originalname,
          fileStream,
          uploadedFile.mimetype
        );
      }
      const user = await Users.create({
        name,
        email,
        status: instructor ? "PENDING" : "APPROVED",
        password: hashedPassword,
        profileImage: uploadedFile ? req.file.originalname : "",
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

      return res.status(200).json({
        success: true,
        data: { user, token },
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  getUsers: async (req, res) => {
    try {
      const users = await Users.findAll();
      res.status(200).send(users);
    } catch (err) {
      console.log(err);
    }
  },
  logout: async (req, res, next) => {
    try {
      const token = req.header("Authorization");

      if (!token) {
        throw generateErrorInstance({
          status: 200,
          message: "user already logout",
        });
      }
      res.removeHeader("Authorization");

      res.status(200).json({
        success: true,
        message: "Logged out",
      });
    } catch (error) {
      next(error);
    }
  },
  updateStatus: async (req, res, next) => {
    try {
      const { userId } = req.params;
      let user = await Users.findOne({
        where: { id: userId },
      });
      console.log(user.status);
      user = await user.update({
        status: "APPROVED",
      });
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {}
  },
  preSignedUrl:async(req,res,next)=>{
    try {
      const {fileName,fileType} = req.body;
      const url= await putObjectUrl(fileName,fileType);
      if(!url){
        throw generateErrorInstance({
          status:404,
          message:"unable to generate presigned url"
        })
      }
      res.status(200).json({
        success:true,
        data:url
      })

    } catch (error) {
      next(error)
    }
  }
};
