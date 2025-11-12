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
  saved.forEach((data) => addMessage(data, false));
  scrollToBottom();
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
  item.classList.add("message");

  // Eigenes vs. fremdes Alignment
  if (data.user === username) {
    item.classList.add("self");
  } else {
    item.classList.add("other");
  }

  // Inhalt der Nachricht
  item.innerHTML = `
    <div class="meta">
      <strong style="color:${data.color || '#fff'}">${data.user}</strong>
      <span>@ ${data.time}</span>
    </div>
    <div class="message-text">${data.message}</div>
  `;

  // Da flex-direction: column-reverse → prepend statt append
  messages.prepend(item);

  if (save) saveMessage(data);
  scrollToBottom();
}

// Scrollen an das untere Ende (neuste Nachricht sichtbar)
function scrollToBottom() {
  // Da column-reverse genutzt wird → oben scrollen
  messages.scrollTop = 0;
}

// Benutzer betritt den Chat
enterChatButton.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name) {
    username = name;
    usernameModal.classList.add("hidden");
    chatContainer.classList.remove("hidden");

    // Zufällige Farbe generieren für diesen Benutzer
    const userColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    socket.emit("set username", { name: username, color: userColor });

    loadMessages();
  }
});

// Nachricht senden
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = messageInput.value.trim();
  if (msg) {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const messageData = {
      user: username,
      message: msg,
      time,
    };

    socket.emit("chat message", messageData);
    addMessage(messageData); // direkt anzeigen
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
  item.textContent = `🟢 ${name} ist dem Chat beigetreten`;
  messages.prepend(item);
  scrollToBottom();
});

socket.on("user left", (name) => {
  const item = document.createElement("li");
  item.classList.add("meta");
  item.textContent = `🔴 ${name} hat den Chat verlassen`;
  messages.prepend(item);
  scrollToBottom();
});

// Aktuelle Benutzeranzahl anzeigen
socket.on("user count", (count) => {
  userCountDisplay.textContent = `👥 Online: ${count}`;
});

// Wenn man die Seite neu lädt oder verlässt → logout erzwingen
window.addEventListener("beforeunload", () => {
  username = "";
});
