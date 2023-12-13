const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema({
  DeviceID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
  },
  Value: Number,
  SensorType: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Measurement = mongoose.model("Measurement", measurementSchema);
module.exports = Measurement;
