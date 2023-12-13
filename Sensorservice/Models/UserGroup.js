const mongoose = require("mongoose");

const userGroupSchema = new mongoose.Schema({
  AdminID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  Description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedAt: Date,
});

const UserGroup = mongoose.model("UserGroup", userGroupSchema);
module.exports = UserGroup;
