import express from "express";
import cors from "cors";
import "dotenv/config";
import debugRouter from "./routers/debug_router.js";
import authRouter from "./routers/auth_router.js";
import favouriteRouter from "./routers/favourite_router.js";
import reviewRouter from "./routers/review_router.js";
import groupRouter from "./routers/group_router.js";


const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Postgres API esimerkki");
});

app.use(debugRouter);
app.use("/auth", authRouter);
app.use("/favourites", favouriteRouter);
app.use("/reviews", reviewRouter);
app.use("/groups", groupRouter);

app.listen(port, () => {
  console.log(`Server is listening port ${port}`);
});
