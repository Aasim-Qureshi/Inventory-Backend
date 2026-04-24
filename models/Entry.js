const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    date: { type: String, required: true },
    type: { type: String, enum: ["received", "issued"], required: true },
    quantity: { type: Number, required: true },
    remarks: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Entry", entrySchema);
