require("dotenv").config();
require("./config/db");
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const qrcode = require("qrcode");
const User = require("./model/user");
const qrCode = require("./model/qrCode");

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

// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!(email && password)) {
//       res.status(400).send("All input is required");
//     }

//     const user = await User.findOne({ email });
//     const pass = await bcrypt.compare(password, user.password);

//     if (user && pass) {
//       //Create Token
//       const token = jwt.sign(
//         { user_id: user._id, email },
//         process.env.TOKEN_KEY,
//         {
//           expiresIn: "2h",
//         }
//       );

//       user.token = token;

//       return res.status(200).json({ token });
//     }
//     return res.status(400).send("Invalid Credentials");
//   } catch (err) {
//     console.log(err);
//   }
// });

// app.post("/qr/generate", async (req, res) => {
//   try {
//     const { userId } = req.body;

//     //validate user input
//     if (!userId) {
//       res.status(400).send("UserId is required");
//     }
//     const user = await User.findById(userId);

//     //Validate if user exists
//     if (!user) {
//       res.status(400).send("User Not Found");
//     }
//     const qrExist = await qrCode.findOne({ userId });
//     if (!qrExist) {
//       await qrCode.create({ userId });
//     } else {
//       await qrCode.findOneAndUpdate({ userId }, { $set: { disabled: true } });
//       await qrCode.create({ userId });
//     }

//     //Generate encrypted data
//     const encryptedData = jwt.sign(
//       { userId: user._id, email },
//       process.env.TOKEN_KEY,
//       {
//         expiresIn: "1d",
//       }
//     );

//     //Generate QR Code
//     const dataImage = await qrCode.toDataUrl(encryptedData);

//     //Return QR Code
//     return res.status(200).json({ dataImage });
//   } catch (err) {
//     console.log(err);
//   }
// });

// app.post("qr/scan", async (req, res) => {
//   try {
//     const { token, deviceInformation } = req.body;

//     if (!token && !deviceInformation) {
//       res.status(400).send("Token and deviceInformation is required");
//     }

//     const decoded = jwt.verify(token, process.env.TOKEN_KEY);

//     const qrCode = await qrCode.findOne({
//       userId: decoded.userId,
//       disabled: false,
//     });

//     if (!qrCode) {
//       res.status(400).send("QR Code not found");
//     }

//     const connectedDeviceData = {
//       userId: decoded.userId,
//       qrCodedId: qrCode._id,
//       deviceName: deviceInformation.deviceName,
//       deviceModel: deviceInformation.deviceModel,
//       deviceOS: deviceInformation.deviceOS,
//       deviceVersion: deviceInformation.deviceVersion,
//     };

//     const connectedDevice = await connectedDevice.create(connectedDeviceData);

//     //Update QR CODE
//     await qrCode.findOneAndUpdate(
//       { _id: qrCode._id },
//       {
//         isActive: true,
//         connectedDeviceId: connectedDevice._id,
//         lastUsedDate: new Date(),
//       }
//     );

//     //Find User
//     const user = await User.findById(decoded.userId);

//     //Create Token
//     const authToken = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY, {
//       expiresIn: "2h",
//     });

//     //Return Token
//     return res.status(200), json({ token: authToken });
//   } catch (err) {
//     console.log(err);
//   }
// }); //COMMENTED OUT FOR NOW

module.exports = app;
