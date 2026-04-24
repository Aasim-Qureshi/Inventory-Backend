const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const Entry = require("../models/Entry");

// Helper: compute running balances sorted by date
function computeBalances(entries) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let bal = 0;
  return sorted.map((e) => {
    bal += e.type === "received" ? e.quantity : -e.quantity;
    return { ...e.toObject(), balance: parseFloat(bal.toFixed(2)) };
  });
}

async function getItemSummary(item) {
  const itemEntries = await Entry.find({ itemId: item._id });
  const withBal = computeBalances(itemEntries);
  const totalReceived = itemEntries
    .filter((e) => e.type === "received")
    .reduce((s, e) => s + e.quantity, 0);
  const totalIssued = itemEntries
    .filter((e) => e.type === "issued")
    .reduce((s, e) => s + e.quantity, 0);
  const balance = withBal.length ? withBal[withBal.length - 1].balance : 0;
  return {
    ...item.toObject(),
    totalReceived,
    totalIssued,
    balance,
    entries: withBal,
  };
}

// GET all items (with summaries)
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    const items = await Item.find(query);
    const result = await Promise.all(items.map(getItemSummary));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new item
router.post("/", async (req, res) => {
  try {
    const { name, unit } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: "Name is required" });
    const item = await Item.create({
      name: name.trim(),
      unit: unit || "Units",
    });
    res.status(201).json(await getItemSummary(item));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE item and its entries
router.delete("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    await Entry.deleteMany({ itemId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET entries for one item
router.get("/:id/entries", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    const itemEntries = await Entry.find({ itemId: req.params.id });
    res.json(computeBalances(itemEntries));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new entry for an item
router.post("/:id/entries", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

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

    if (type === "issued") {
      const summary = await getItemSummary(item);
      if (summary.balance < qty)
        return res.status(400).json({
          error: `Insufficient balance. Current: ${summary.balance} ${item.unit}`,
        });
    }

    const entry = await Entry.create({
      itemId: item._id,
      date,
      type,
      quantity: qty,
      remarks: (remarks || "").trim(),
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, computeBalances };
