import Timer from "./timer.js";
import ShotClock from "./shot-clock.js";

const timerDisplay = document.getElementById("timerDisp");
const timer = new Timer(timerDisplay);

const shotClockDisplay = document.getElementById("shotClockDisp");
const shotClock = new ShotClock(shotClockDisplay);

let wsProtocol = "ws:";
let wsHost = window.location.host;

if (window.location.protocol === "https:") {
  wsProtocol = "wss:";
}

const wsUrl = `${wsProtocol}//${wsHost}`;

let socket = null;
let reconnectTimer = null;
let reconnectDelay = 1000;
const MAX_RECONNECT_DELAY = 15000;

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  const delay = reconnectDelay;
  reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
  console.log(`Reconnecting display WebSocket in ${delay}ms`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectWebSocket();
  }, delay);
}

function ensureConnected() {
  if (
    !socket ||
    socket.readyState === WebSocket.CLOSED ||
    socket.readyState === WebSocket.CLOSING
  ) {
    clearReconnectTimer();
    reconnectDelay = 1000;
    connectWebSocket();
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    ensureConnected();
    if (typeof fetchData === "function") {
      try { fetchData(true); } catch (e) { fetchData(); }
    }
  }
});

window.addEventListener("online", () => {
  ensureConnected();
});

window.addEventListener("focus", () => {
  ensureConnected();
});

function attachDisplayHandlers(sock) {
  sock.onopen = () => {
    console.log("WebSocket connection established in display page");
    reconnectDelay = 1000;
    clearReconnectTimer();
    if (typeof fetchData === "function") {
      try { fetchData(true); } catch (e) { fetchData(); }
    }
  };

  sock.onerror = (error) => {
    console.error("WebSocket Error in display page: ", error);
  };

  sock.onclose = () => {
    console.log("WebSocket connection closed in display page");
    scheduleReconnect();
  };
}

function connectWebSocket() {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }
  console.log("Connecting display WebSocket to", wsUrl);
  socket = new WebSocket(wsUrl);
  attachDisplayHandlers(socket);
  if (typeof bindDisplayMessageHandler === "function") {
    bindDisplayMessageHandler(socket);
  }
}

/* socket created by connectWebSocket() */

// Team color config — teams are fixed, no logo switching needed
const TEAM_COLORS = {
  "Payback": "payback",
  "First Blood": "firstblood",
  "Street Fight": "streetfight",
};

function applyTeamColor(sectionId, teamName) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  // Remove all color classes
  Object.values(TEAM_COLORS).forEach(cls => section.classList.remove(cls));
  const colorClass = TEAM_COLORS[teamName];
  if (colorClass) section.classList.add(colorClass);
}

function handleMessage(data) {
  if (data.type === "team1Point") {
    document.getElementById("team1-score").innerText = data.team1Score;
  }
  if (data.type === "team2Point") {
    document.getElementById("team2-score").innerText = data.team2Score;
  }
  if (data.type === "team3Point") {
    document.getElementById("team3-score").innerText = data.team3Score;
  }
  if (data.type === "roundNum") {
    document.getElementById("roundNumDisplay").innerText = data.roundNum;
  }
  if (data.type === "jamNum") {
    document.getElementById("jamNumDisplay").innerText = data.jamNum;
  }

  // Timer
  if (data.type === "start") timer.startTimer();
  if (data.type === "pause") timer.pauseTimer();
  if (data.type === "reset") timer.resetTimer();
  if (data.type === "resume") timer.resumeTimer();
  if (data.type === "addMinute") timer.addMinute();
  if (data.type === "subtractMinute") timer.subtractMinute();
  if (data.type === "addSecond") timer.addSecond();
  if (data.type === "subtractSecond") timer.subtractSecond();

  // Shot clock
  if (data.type === "startSC") shotClock.startSC();
  if (data.type === "pauseSC") shotClock.pauseSC();
  if (data.type === "resumeSC") shotClock.resumeSC();
  if (data.type === "resetTo24SC") shotClock.resetTo24SC();
  if (data.type === "resetTo14SC") shotClock.resetTo14SC();
  if (data.type === "addSecondSC") shotClock.addSecondSC();
  if (data.type === "subtractSecondSC") shotClock.subtractSecondSC();

  if (data.type === "pong") {
    console.log("Received pong from server");
  }
  if (data.type === "initialData" && data.payload) {
    useData(data.payload);
  }
}

function bindDisplayMessageHandler(sock) {
sock.addEventListener("message", (event) => {
  if (event.data instanceof Blob) {
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const data = JSON.parse(reader.result);
        handleMessage(data);
      } catch (error) {
        console.error("Error parsing Blob message:", error);
      }
    };
    reader.readAsText(event.data);
  } else {
    try {
      const data = JSON.parse(event.data);
      handleMessage(data);
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  }
});
}


function fetchData(quiet = false) {
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
    });
}

function useData(data) {
  document.getElementById("team1-score").innerText = data.team1Score ?? 0;
  document.getElementById("team2-score").innerText = data.team2Score ?? 0;
  document.getElementById("team3-score").innerText = data.team3Score ?? 0;

  document.getElementById("roundNumDisplay").innerText = data.roundNum ?? 1;
  document.getElementById("jamNumDisplay").innerText = data.jamNum ?? 1;

  // Apply team name text & color
  const t1 = data.team1Name || "Payback";
  const t2 = data.team2Name || "First Blood";
  const t3 = data.team3Name || "Street Fight";

  document.getElementById("team1-name").innerText = t1;
  document.getElementById("team2-name").innerText = t2;
  document.getElementById("team3-name").innerText = t3;

  applyTeamColor("team1Section", t1);
  applyTeamColor("team2Section", t2);
  applyTeamColor("team3Section", t3);
}

window.onload = () => {
  fetchData();
};

connectWebSocket();

setInterval(() => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "ping" }));
  } else if (document.visibilityState === "visible") {
    ensureConnected();
  }
}, 25000);
