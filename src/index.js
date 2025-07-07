import Dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import http from "http";
import { Server } from "socket.io";

Dotenv.config({
  path: "./env",
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("task-updated", (data) => {
    socket.broadcast.emit("task-updated", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(
        `✅ Server (with Socket.IO) is running on port ${process.env.PORT || 8000}`
      );
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed", err);
  });
