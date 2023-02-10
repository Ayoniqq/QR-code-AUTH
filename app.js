require("dotenv").config();
require("./config/db");
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const qrcode = require("qrcode"); //PACKAGE
const User = require("./model/user"); //MODEL
const qrCode = require("./model/qrCode"); //MODEL
const ejs = require("ejs");

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("HOME PAGE");
});

app.get("/register", (req, res) => {
  res.render("");
});
app.post("/register", async (req, res) => {
  try {
    // const { first_name, last_name, email, password } = req.body;
    const first_name = "User8";
    const last_name = "Client8";
    const email = "User8@gmail.com";
    const password = "12345678";

    console.log("Good credentials");

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
    console.log("Good credentials");
    // const { email, password } = req.body;
    const email = "user8@gmail.com";
    const password = "12345678";

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    //console.log(password);

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).send("User not found"); //DONT USE THIS FOR PRODUCTION, Not good to give the user hint that one is incorrect
    }
    const pass = await bcrypt.compare(password, user.password);
    console.log(user.password);
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

app.post("/qr/generate", async (req, res) => {
  try {
    // const { userId } = req.body;
    const email = "user8@gmail.com";
    const userId = "63e4cf6c3e20b80d7b746331";

    //validate user input
    if (!userId) {
      res.status(400).send("UserId is required");
    }
    const user = await User.findById(userId);

    //Validate if user exists
    if (!user) {
      res.status(400).send("User Not Found");
    }
    const qrExist = await qrCode.findOne({ userId });
    if (!qrExist) {
      await qrCode.create({ userId });
    } else {
      await qrCode.findOneAndUpdate({ userId }, { $set: { disabled: true } });
      await qrCode.create({ userId });
      //      console.log("HAS BEEN CREATED");
    }

    //Generate encrypted data
    const encryptedData = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "1d",
      }
    );
    console.log(encryptedData);

    //Generate QR Code
    const dataImage = await qrcode.toDataURL(encryptedData); //HAd issues with this line, i was calling the model instead of qrcode package

    //Return QR Code
    return res.status(200).json({ dataImage });
  } catch (err) {
    console.log(err);
  }
});

app.post("/qr/scan", async (req, res) => {
  try {
    // const { token, deviceInformation } = req.body;
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjNlNGNmNmMzZTIwYjgwZDdiNzQ2MzMxIiwiZW1haWwiOiJ1c2VyOEBnbWFpbC5jb20iLCJpYXQiOjE2NzYwMjU4MzksImV4cCI6MTY3NjExMjIzOX0.tkTONUWKD4Jq0xQgL1se0Ckldy32VR4fIdl8cNrT27U";
    const deviceInformation = "iPhone 12";

    if (!token && !deviceInformation) {
      res.status(400).send("Token and deviceInformation is required");
    }

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    if (decoded) {
      console.log("DECODED");
    }

    const qrCoded = await qrCode.findOne({
      userId: decoded.userId,
      disabled: false,
    });

    if (!qrCoded) {
      res.status(400).send("QR Code not found");
    }

    const connectedDeviceData = {
      userId: decoded.userId,
      qrCodedId: qrCoded._id,
      deviceName: deviceInformation.deviceName,
      deviceModel: deviceInformation.deviceModel,
      deviceOS: deviceInformation.deviceOS,
      deviceVersion: deviceInformation.deviceVersion,
    };

    const connectedDevice = await connectedDevice.create(connectedDeviceData);

    //Update QR CODE
    await qrCode.findOneAndUpdate(
      { _id: qrCode._id },
      {
        isActive: true,
        connectedDeviceId: connectedDevice._id,
        lastUsedDate: new Date(),
      }
    );

    //Find User
    const user = await User.findById(decoded.userId);

    //Create Token
    const authToken = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY, {
      expiresIn: "2h",
    });

    //Return Token
    return res.status(200), json({ token: authToken });
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;
