const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    UniqueDeviceID: {
      type: String,
      unique: true,
      required: true,
    },
    OwnerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    DeviceName: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    Location: String,
    Status: {
      type: String,
      default: "Gesund",
    },
    // modifiedAt: Date,
    // Room: String,
    // FirmwareVersion: String,
    // ModelVersion: String,
  },
  {
    versionKey: null,
  }
);

const Device = mongoose.model("Device", deviceSchema);
module.exports = Device;
