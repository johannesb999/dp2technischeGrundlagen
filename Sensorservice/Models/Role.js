const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  RoleName: {
    type: String,
    required: true,
  },
});

const Role = mongoose.model("Role", roleSchema);
module.exports = Role;
