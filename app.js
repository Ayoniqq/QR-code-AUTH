require("dotenv").config();
require("./config/db");
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const qrcode = require("qrcode");
const User = require("./model/user");
const { findOne } = require("./model/user");

app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("HOME PAGE");
// });
app.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    //validate user input
    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }
    //Check if user already exists
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(409).send("User Already Exists. Kindly Login");
    }

    // Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    //Create User in our db
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });

    //Create Token
    const token = jwt.sign(
      {
        user_id: user._id,
        email,
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

    //return new User
    res.status(201).json({ token });
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    const user = await User.findOne({ email });
    const pass = await bcrypt.compare(password, user.password);

    if (user && pass) {
      //Create Token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      user.token = token;

      return res.status(200).json({ token });
    }
    return res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;

// app.listen(PORT, (req, res) => {
//   console.log(`LISTENING ON PORT: ${PORT}`);
// });
