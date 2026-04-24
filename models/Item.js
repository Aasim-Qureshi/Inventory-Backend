const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    unit: { type: String, default: "Units", trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Item", itemSchema);
