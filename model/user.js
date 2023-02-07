const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  first_name: { type: String, default: null },
  last_name: { type: String, default: null },
  email: { type: String, uniuqe: true },
  password: { type: String },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
