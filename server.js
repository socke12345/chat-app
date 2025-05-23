const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Ein Benutzer ist verbunden");

  socket.on("set username", (username) => {
    socket.username = username || "Anonym";
    socket.broadcast.emit("user joined", socket.username);
  });

  socket.on("chat message", (msg) => {
    const time = new Date().toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit"
    });

    io.emit("chat message", {
      user: socket.username || "Anonym",
      time: time,
      message: msg
    });
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      socket.broadcast.emit("user left", socket.username);
    }
  });
});

http.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
