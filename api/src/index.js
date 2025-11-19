import express from "express";
import cors from "cors";
import "dotenv/config";
import debugRouter from "./routers/debug_router.js";
import bookRouter from "./routers/book_router.js";
import authRouter from "./routers/auth_router.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Postgres API esimerkki");
});

// Kaikki debug-reitit käyttöön:
app.use(debugRouter);
// jos haluaisit prefixin, käyttäisit esim:
// app.use("/api", debugRouter);

app.use("/book", bookRouter);
app.use("/auth", authRouter);

app.listen(port, () => {
  console.log(`Server is listening port ${port}`);
});
