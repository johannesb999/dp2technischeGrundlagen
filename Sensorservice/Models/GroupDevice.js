const mongoose = require("mongoose");

const groupDeviceSchema = new mongoose.Schema({
  GroupID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserGroup",
  },
  DeviceID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
  },
  modifiedAt: Date,
});

const GroupDevice = mongoose.model("GroupDevice", groupDeviceSchema);
module.exports = GroupDevice;
