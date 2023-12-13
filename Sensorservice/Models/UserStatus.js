const mongoose = require("mongoose");

const userStatusSchema = new mongoose.Schema({
  StatusName: {
    type: String,
    required: true,
  },
});

const UserStatus = mongoose.model("UserStatus", userStatusSchema);
module.exports = UserStatus;
