const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const connDevSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  qrCodeId: {
    type: SchemaTypes.Types.ObjectId,
    required: true,
    ref: "qrCodes",
  },
  deviceName: { type: String, default: null },
  deviceModel: { type: String, default: null },
  deviceOS: { type: String, default: null },
  deviceVersion: { type: String, default: null },
  disabled: { type: Boolean, default: false },
});

const connDev = mongoose.model("connDev", connDevSchema); //IF WAHALA DEY< CHANGE connDEv to connectedDevice

module.exports = connDev;
