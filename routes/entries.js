const express = require("express");
const router = express.Router();
const Entry = require("../models/Entry");
const { requireAuth } = require("../middleware/auth");

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { date, type, quantity, remarks } = req.body;
    if (!date || !type || !quantity)
      return res
        .status(400)
        .json({ error: "date, type, and quantity are required" });
    if (!["received", "issued"].includes(type))
      return res.status(400).json({ error: "type must be received or issued" });
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0)
      return res
        .status(400)
        .json({ error: "quantity must be a positive number" });
    const entry = await Entry.findByIdAndUpdate(
      req.params.id,
      { date, type, quantity: qty, remarks: (remarks || "").trim() },
      { new: true },
    );
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const entry = await Entry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
