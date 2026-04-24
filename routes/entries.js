const express = require("express");
const router = express.Router();
const Entry = require("../models/Entry");

// DELETE a single entry
router.delete("/:id", async (req, res) => {
  try {
    const entry = await Entry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
