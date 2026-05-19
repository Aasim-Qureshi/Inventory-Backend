require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { router: itemsRouter } = require("./routes/items");
const entriesRouter = require("./routes/entries");
const items = require("./routes/items");
const transactionsRouter = require("./routes/transactions");
const authRouter = require("./routes/auth");

connectDB();

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://inventory-frontend-sepia.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());

const session = require("express-session");

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-me-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // required when sameSite is 'none'
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

      maxAge: 8 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/items", itemsRouter);
app.use("/api/entries", entriesRouter);
app.use("/api/transactions", transactionsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Inventory API running on http://localhost:${PORT}`),
);
