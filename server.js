require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { router: itemsRouter } = require("./routes/items");
const entriesRouter = require("./routes/entries");
const transactionsRouter = require("./routes/transactions");

connectDB();

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://inventory-frontend-sepia.vercel.app",
      "https://inventory-frontend-sepia.vercel.app/",
    ],
  }),
);
app.use(express.json());

app.use("/api/items", itemsRouter);
app.use("/api/entries", entriesRouter);
app.use("/api/transactions", transactionsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Inventory API running on http://localhost:${PORT}`),
);
