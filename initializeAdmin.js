const bcrypt = require("bcryptjs");
const { Users } = require("./models");

async function initializeAdmin() {
  // Check if an admin user already exists
  const adminExists = await Users.findOne({ where: { role: "ADMIN" } });

  if (!adminExists) {
    // Create a new admin user
    const adminData = {
      name: "ADMIN",
      email: "engr.jamal04@gmail.com",
      password: "engr.jamal04@gmail.com",
      role: "ADMIN",
      status: "APPROVED",
      gender: "MALE",
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    };

    // Hash the password before storing it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);
    adminData.password = hashedPassword;

    // Create the admin user
    await Users.create(adminData);

    console.log("Admin user created successfully.");
  } else {
    console.log("Admin user already exists.");
  }

  process.exit();
}

initializeAdmin();
