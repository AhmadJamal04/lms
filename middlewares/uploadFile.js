const multer = require("multer");
const fs = require("fs");
const { generateErrorInstance } = require("../utils");
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    var newDestination = "uploads/" + req.params.__something;
    var stat = null;
    try {
      stat = fs.statSync(newDestination);
    } catch (err) {
      fs.mkdirSync(newDestination);
    }
    if (stat && !stat.isDirectory()) { 
      throw generateErrorInstance({
        status: 404,
        message:
          'Directory cannot be created because an inode of a different type exists at "' +
          newDestination +
          '"',
      });
    }
    cb(null, newDestination);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = file.originalname.split(".").pop();
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + fileExtension);
  },
});
const upload = multer({ storage: multerStorage });
module.exports = upload;
