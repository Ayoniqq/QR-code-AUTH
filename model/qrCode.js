const mongoose = require("mongoose");
//const {Schema} = mongoose;
const Schema = mongoose.Schema;

const qrCodeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },

  connectedDeviceId: {
    type: Schema.Types.ObjectId,
    ref: "connectedDevices",
  },
  lastUsedDate: { type: Date, deault: null },
  isActive: { type: Boolean, default: false },
  disabled: { type: Boolean, deuault: false },
});

const qrCode = mongoose.model("qrCode", qrCodeSchema);

module.exports = qrCode;
