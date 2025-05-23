const socket = io();

const usernameModal = document.getElementById("usernameModal");
const usernameInput = document.getElementById("usernameInput");
const enterChatButton = document.getElementById("enterChat");

const chatContainer = document.getElementById("chatContainer");
const messages = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

let username = "";

enterChatButton.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name) {
    username = name;
    usernameModal.classList.add("hidden");
    chatContainer.classList.remove("hidden");
    socket.emit("set username", username);
  }
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = messageInput.value.trim();
  if (msg) {
    socket.emit("chat message", msg);
    messageInput.value = "";
  }
});

socket.on("chat message", (data) => {
  const item = document.createElement("li");
  item.innerHTML = `<div><strong>${data.user}</strong> <span class="meta">@ ${data.time}</span></div>
                    <div>${data.message}</div>`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

socket.on("user joined", (name) => {
  const item = document.createElement("li");
  item.classList.add("meta");
  item.textContent = `🔵 ${name} ist dem Chat beigetreten`;
  messages.appendChild(item);
});

socket.on("user left", (name) => {
  const item = document.createElement("li");
  item.classList.add("meta");
  item.textContent = `🔴 ${name} hat den Chat verlassen`;
  messages.appendChild(item);
});
