let wsProtocol = "ws:";
let wsHost = window.location.host;

if (window.location.protocol === "https:") {
  wsProtocol = "wss:";
}

const wsUrl = `${wsProtocol}//${wsHost}`;
const socket = new WebSocket(wsUrl);

socket.onopen = () => {
  console.log("WebSocket connection established");
};

socket.onerror = (error) => {
  console.error("WebSocket Error: ", error);
};

socket.onclose = () => {
  console.log("WebSocket connection closed");
};

socket.onmessage = function (event) {
  console.log("Data from server: ", event.data);
};

// Keepalive ping every 25 seconds
setInterval(() => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "ping" }));
  }
}, 25000);

// Variables
let team1Score;
let team2Score;
let team3Score;
let team1Name = "Payback";
let team2Name = "First Blood";
let team3Name = "Street Fight";
let roundNum = 1;
let jamNum = 1;

function writeTheData() {
  const data = {
    team1Name,
    team2Name,
    team3Name,
    team1Score,
    team2Score,
    team3Score,
    roundNum,
    jamNum,
  };

  fetch("/saveData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => console.log(result))
    .catch((error) => console.error("Error:", error));
}

function fetchData() {
  fetch("/api/recentData")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      console.log("Retrieved data:", data);
      useData(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      alert("Failed to retrieve data. Check the console.");
    });
}

function useData(data) {
  team1Score = parseFloat(data.team1Score) || 0;
  team2Score = parseFloat(data.team2Score) || 0;
  team3Score = parseFloat(data.team3Score) || 0;

  team1Name = data.team1Name || "Payback";
  team2Name = data.team2Name || "First Blood";
  team3Name = data.team3Name || "Street Fight";

  roundNum = parseInt(data.roundNum) || 1;
  jamNum = parseInt(data.jamNum) || 1;

  socket.send(JSON.stringify({ type: "team1Point", team1Score }));
  socket.send(JSON.stringify({ type: "team2Point", team2Score }));
  socket.send(JSON.stringify({ type: "team3Point", team3Score }));
  socket.send(JSON.stringify({ type: "roundNum", roundNum }));
  socket.send(JSON.stringify({ type: "jamNum", jamNum }));

  document.getElementById("override-team1-score-input").value = team1Score;
  document.getElementById("override-team2-score-input").value = team2Score;
  document.getElementById("override-team3-score-input").value = team3Score;
  document.getElementById("roundNum").value = roundNum;
  document.getElementById("jamNum").value = jamNum;
}

function overrideScore(team) {
  if (team === 1) {
    team1Score = parseFloat(document.getElementById("override-team1-score-input").value);
    socket.send(JSON.stringify({ type: "team1Point", team1Score }));
  }
  if (team === 2) {
    team2Score = parseFloat(document.getElementById("override-team2-score-input").value);
    socket.send(JSON.stringify({ type: "team2Point", team2Score }));
  }
  if (team === 3) {
    team3Score = parseFloat(document.getElementById("override-team3-score-input").value);
    socket.send(JSON.stringify({ type: "team3Point", team3Score }));
  }
  writeTheData();
}

function overrideRoundJam(item) {
  if (item === 1) {
    roundNum = document.getElementById("roundNum").value;
    socket.send(JSON.stringify({ type: "roundNum", roundNum }));
  }
  if (item === 2) {
    jamNum = document.getElementById("jamNum").value;
    socket.send(JSON.stringify({ type: "jamNum", jamNum }));
  }
  writeTheData();
}

function resetScore() {
  team1Score = 0;
  team2Score = 0;
  team3Score = 0;
  roundNum = 1;
  jamNum = 1;

  socket.send(JSON.stringify({ type: "team1Point", team1Score }));
  socket.send(JSON.stringify({ type: "team2Point", team2Score }));
  socket.send(JSON.stringify({ type: "team3Point", team3Score }));
  socket.send(JSON.stringify({ type: "roundNum", roundNum }));
  socket.send(JSON.stringify({ type: "jamNum", jamNum }));

  document.getElementById("override-team1-score-input").value = 0;
  document.getElementById("override-team2-score-input").value = 0;
  document.getElementById("override-team3-score-input").value = 0;
  document.getElementById("roundNum").value = 1;
  document.getElementById("jamNum").value = 1;

  writeTheData();
}

// Event listeners
document.getElementById("override-team1-score-input").addEventListener("input", () => overrideScore(1));
document.getElementById("minus1").addEventListener("click", () => overrideScore(1));
document.getElementById("plus1").addEventListener("click", () => overrideScore(1));

document.getElementById("override-team2-score-input").addEventListener("input", () => overrideScore(2));
document.getElementById("minus2").addEventListener("click", () => overrideScore(2));
document.getElementById("plus2").addEventListener("click", () => overrideScore(2));

document.getElementById("override-team3-score-input").addEventListener("input", () => overrideScore(3));
document.getElementById("minus3score").addEventListener("click", () => overrideScore(3));
document.getElementById("plus3score").addEventListener("click", () => overrideScore(3));

document.getElementById("roundNum").addEventListener("input", () => overrideRoundJam(1));
document.getElementById("minus3").addEventListener("click", () => overrideRoundJam(1));
document.getElementById("plus3").addEventListener("click", () => overrideRoundJam(1));

document.getElementById("jamNum").addEventListener("input", () => overrideRoundJam(2));
document.getElementById("minus4").addEventListener("click", () => overrideRoundJam(2));
document.getElementById("plus4").addEventListener("click", () => overrideRoundJam(2));

document.getElementById("resetScore").addEventListener("click", () => resetScore());

window.addEventListener("load", function () {
  setTimeout(function () {
    fetchData();
  }, 2000);
});