const mongoose = require("mongoose");

const groupUserSchema = new mongoose.Schema({
  UserID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  GroupID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserGroup",
  },
  Admin: {
    type: Boolean,
    default: false,
  },
  Description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GroupUser = mongoose.model("GroupUser", groupUserSchema);
module.exports = GroupUser;
