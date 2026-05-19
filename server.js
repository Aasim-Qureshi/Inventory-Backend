require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");

const connectDB = require("./config/db");

const { router: itemsRouter } = require("./routes/items");
const entriesRouter = require("./routes/entries");
const transactionsRouter = require("./routes/transactions");

connectDB();

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: "https://inventory-frontend-sepia.vercel.app",
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-me-in-production",
    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 8 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/items", itemsRouter);
app.use("/api/entries", entriesRouter);
app.use("/api/transactions", transactionsRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
