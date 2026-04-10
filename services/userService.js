const crypto = require("crypto");
const { generateErrorInstance } = require("../utils");

const ensureRequiredSignupFields = ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw generateErrorInstance({
      status: 400,
      message: "Required fields can't be empty",
    });
  }
};

const ensureRequiredLoginFields = ({ email, password }) => {
  if (!email || !password) {
    throw generateErrorInstance({
      status: 400,
      message: "Required fields can't be empty",
    });
  }
};

const sanitizeUserForAuthResponse = (user) => {
  const safeUser = user.toJSON();
  delete safeUser.password;
  return safeUser;
};

const buildResetPasswordTokenPayload = () => {
  const resetToken = crypto.randomBytes(20).toString("hex");
  return {
    resetToken,
    hashedToken: crypto.createHash("sha256").update(resetToken).digest("hex"),
    resetPasswordTokenExpiry: Date.now() + 15 * 60 * 1000,
  };
};

module.exports = {
  ensureRequiredSignupFields,
  ensureRequiredLoginFields,
  sanitizeUserForAuthResponse,
  buildResetPasswordTokenPayload,
};
