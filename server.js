const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

// Liste der aktuell verbundenen Benutzer
const users = new Map();

io.on("connection", (socket) => {
  console.log("Ein Benutzer ist verbunden");

  // Wenn sich jemand verbindet, aber noch keinen Namen gesetzt hat
  io.emit("user count", users.size);

  // Benutzername + Farbe speichern
  socket.on("set username", (data) => {
    socket.username = data.name || "Anonym";
    socket.color = data.color || "#ffffff";

    // In die Userliste eintragen
    users.set(socket.id, { name: socket.username, color: socket.color });

    console.log(`${socket.username} hat sich verbunden.`);
    io.emit("user count", users.size);
    socket.broadcast.emit("user joined", socket.username);

    // Allen die aktuelle Userliste schicken
    io.emit("user list", Array.from(users.values()));
  });

  // Nachricht empfangen
  socket.on("chat message", (msgData) => {
    const time = new Date().toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const messageData = {
      user: socket.username || "Anonym",
      color: socket.color || "#ffffff",
      message: msgData.message || msgData, // Fallback falls alter Format
      time,
    };

    io.emit("chat message", messageData);
  });

  // Benutzer trennt die Verbindung
  socket.on("disconnect", () => {
    if (socket.username) {
      console.log(`${socket.username} hat den Chat verlassen.`);
      socket.broadcast.emit("user left", socket.username);
    }

    // Aus Liste löschen
    users.delete(socket.id);
    io.emit("user count", users.size);
    io.emit("user list", Array.from(users.values()));
  });
});

http.listen(PORT, () => {
  console.log(`✅ Server läuft auf Port ${PORT}`);
});
