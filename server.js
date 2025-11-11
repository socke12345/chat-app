const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let onlineUsers = 0;

io.on("connection", (socket) => {
  console.log("Ein Benutzer ist verbunden");
  onlineUsers++;
  io.emit("user count", onlineUsers);

  socket.on("set username", (username) => {
    socket.username = username || "Anonym";
    socket.broadcast.emit("user joined", socket.username);
  });

  socket.on("chat message", (msg) => {
    const time = new Date().toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const messageData = {
      user: socket.username || "Anonym",
      time,
      message: msg
    };

    io.emit("chat message", messageData);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      socket.broadcast.emit("user left", socket.username);
    }
    onlineUsers--;
    io.emit("user count", onlineUsers);
  });
});

http.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
