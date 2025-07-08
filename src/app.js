import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is live ✅");
});


// Importing routes

import userRouter from "./routes/user.routes.js";
import taskRouter from "./routes/task.routes.js";
import actionRouter from "./routes//action.routes.js";

// Using routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/task", taskRouter);
app.use("/api/v1/action", actionRouter);

export { app };


