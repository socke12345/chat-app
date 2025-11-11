const socket = io();

// Elemente referenzieren
const usernameModal = document.getElementById("usernameModal");
const usernameInput = document.getElementById("usernameInput");
const enterChatButton = document.getElementById("enterChat");

const chatContainer = document.getElementById("chatContainer");
const messages = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const userCountDisplay = document.getElementById("userCount");

let username = "";

// Nachrichten aus localStorage laden
function loadMessages() {
  const saved = JSON.parse(localStorage.getItem("chatMessages")) || [];
  messages.innerHTML = "";
  saved.forEach((data) => {
    addMessage(data, false);
  });
  messages.scrollTop = messages.scrollHeight;
}

// Nachricht im localStorage speichern
function saveMessage(data) {
  const saved = JSON.parse(localStorage.getItem("chatMessages")) || [];
  saved.push(data);
  localStorage.setItem("chatMessages", JSON.stringify(saved));
}

// Nachricht im DOM anzeigen
function addMessage(data, save = true) {
  const item = document.createElement("li");
  item.innerHTML = `
    <div><strong>${data.user}</strong> <span class="meta">@ ${data.time}</span></div>
    <div>${data.message}</div>
  `;
  messages.appendChild(item);
  if (save) saveMessage(data);
  messages.scrollTop = messages.scrollHeight;
}

// Benutzer betritt den Chat
enterChatButton.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name) {
    username = name;
    usernameModal.classList.add("hidden");
    chatContainer.classList.remove("hidden");
    socket.emit("set username", username);
    loadMessages();
  }
});

// Nachricht senden
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = messageInput.value.trim();
  if (msg) {
    socket.emit("chat message", msg);
    messageInput.value = "";
  }
});

// Empfangene Chatnachricht
socket.on("chat message", (data) => {
  addMessage(data);
});

// Nutzer beigetreten / verlassen
socket.on("user joined", (name) => {
  const item = document.createElement("li");
  item.classList.add("meta");
  item.textContent = `🔵 ${name} ist dem Chat beigetreten`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

socket.on("user left", (name) => {
  const item = document.createElement("li");
  item.classList.add("meta");
  item.textContent = `🔴 ${name} hat den Chat verlassen`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

// Aktuelle Benutzeranzahl anzeigen
socket.on("user count", (count) => {
  userCountDisplay.textContent = `👥 Online: ${count}`;
});

// Wenn man die Seite neu lädt oder verlässt → logout erzwingen
window.addEventListener("beforeunload", () => {
  username = "";
  // Benutzername wird nicht gespeichert
});
