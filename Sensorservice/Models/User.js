const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Name: String,
  Email: {
    type: String,
    unique: true,
  },
  Password: String,
  RoleID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
  },
  StatusID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserStatus",
  },
  Deleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedAt: Date,
});

const User = mongoose.model("User", userSchema);
module.exports = User;
