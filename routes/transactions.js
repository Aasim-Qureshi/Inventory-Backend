const express = require("express");
const router = express.Router();
const Entry = require("../models/Entry");
const Item = require("../models/Item");

// GET all transactions with optional filters
router.get("/", async (req, res) => {
  try {
    const { search, type, from, to } = req.query;

    const entryQuery = {};
    if (type && type !== "all") entryQuery.type = type;
    if (from || to) {
      entryQuery.date = {};
      if (from) entryQuery.date.$gte = from;
      if (to) entryQuery.date.$lte = to;
    }

    const entries = await Entry.find(entryQuery).sort({ date: -1 });
    const items = await Item.find();
    const itemMap = Object.fromEntries(items.map((i) => [i._id.toString(), i]));

    let result = entries.map((e) => {
      const item = itemMap[e.itemId.toString()];
      return {
        ...e.toObject(),
        itemName: item ? item.name : "Unknown",
        itemUnit: item ? item.unit : "",
      };
    });

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.itemName.toLowerCase().includes(q) ||
          (t.remarks && t.remarks.toLowerCase().includes(q)),
      );
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
