import Timer from "./timer.js";
import ShotClock from "./shot-clock.js";

const timerDisplay = document.getElementById("timerDisp");
const timer = new Timer(timerDisplay); // Create a timer instance

const shotClockDisplay = document.getElementById("shotClockDisp"); // This is the display element for the shot clock
const shotClock = new ShotClock(shotClockDisplay); // Create a shot clock instance

// const socket = new WebSocket(`wss://${window.location.host}`);

let wsProtocol = "ws:"; // Default to unsecure WebSocket for development
let wsHost = window.location.host; // Use the current page's host (e.g., localhost:3000 or your-domain.com)

// If the page itself is loaded over HTTPS, use wss for the WebSocket
if (window.location.protocol === "https:") {
  wsProtocol = "wss:";
}

// Construct the full WebSocket URL
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


// Handle incoming WebSocket messages
function bindDisplayMessageHandler(sock) {
sock.addEventListener("message", (event) => {
  // Check if the data is a Blob
  if (event.data instanceof Blob) {
    const reader = new FileReader();

    reader.onload = function () {
      try {
        // Convert Blob to text
        const text = reader.result;
        console.log("Initial Text (Blob):", text);

        // Convert the text as JSON
        const data = JSON.parse(text);
        console.log("Parsed data:", data);

        // Handle the parsed data
        if (data.type == "updateName1") {
          document.getElementById("team1-name").innerText = data.team1Name;
          switch (data.team1Name) {
          case "Thrash Pandas":
            document.getElementById(
              "team1Logo"
              ).innerHTML = `<img src="/images/thrashpandas-logo.png">`;
            break;
          case "X Force":
            document.getElementById(
              "team1Logo"
              ).innerHTML = `<img src="/images/xforce-logo.png">`;
            break;
          case "Riotmakers":
            document.getElementById(
              "team1Logo"
              ).innerHTML = `<img src="/images/riotmakers-logo.png">`;
            break;
          }
          switch (data.team1Name) {
          case "Thrash Pandas":
            document.getElementById("team1Section").classList.add("purple");
            document.getElementById("team1Section").classList.remove("yellow");
            document.getElementById("team1Section").classList.remove("green");
            break;
          case "X Force":
            document.getElementById("team1Section").classList.add("yellow");
            document.getElementById("team1Section").classList.remove("green");
            document.getElementById("team1Section").classList.remove("purple");
            break;
          case "Riotmakers":
            document.getElementById("team1Section").classList.add("green");
            document.getElementById("team1Section").classList.remove("purple");
            document.getElementById("team1Section").classList.remove("yellow");
            break;
          }
        }
        if (data.type == "updateName2") {
          document.getElementById("team2-name").innerText = data.team2Name;
          switch (data.team2Name) {
          case "Thrash Pandas":
            document.getElementById(
              "team2Logo"
              ).innerHTML = `<img src="/images/thrashpandas-logo.png">`;
            break;
          case "X Force":
            document.getElementById(
              "team2Logo"
              ).innerHTML = `<img src="/images/xforce-logo.png">`;
            break;
          case "Riotmakers":
            document.getElementById(
              "team2Logo"
              ).innerHTML = `<img src="/images/riotmakers-logo.png">`;
            break;
          }
          switch (data.team2Name) {
          case "Thrash Pandas":
            document.getElementById("team2Section").classList.add("purple");
            document.getElementById("team2Section").classList.remove("yellow");
            document.getElementById("team2Section").classList.remove("green");
            break;
          case "X Force":
            document.getElementById("team2Section").classList.add("yellow");
            document.getElementById("team2Section").classList.remove("green");
            document.getElementById("team2Section").classList.remove("purple");
            break;
          case "Riotmakers":
            document.getElementById("team2Section").classList.add("green");
            document.getElementById("team2Section").classList.remove("purple");
            document.getElementById("team2Section").classList.remove("yellow");
            break;
          }
        }
        if (data.type == "team1Point") {
          document.getElementById("team1-score").innerText = data.team1Score;
        }
        if (data.type == "team2Point") {
          document.getElementById("team2-score").innerText = data.team2Score;
        }
        
        if (data.type == "roundNum") {
          document.getElementById("roundNumDisplay").innerText = data.roundNum;
        }
        if (data.type == "jamNum") {
          document.getElementById("jamNumDisplay").innerText = data.jamNum;
        }

        // timer
        if (data.type == "start") {
          timer.startTimer();
        }
        if (data.type == "pause") {
          timer.pauseTimer();
        }
        if (data.type == "reset") {
          timer.resetTimer();
        }
        if (data.type == "resume") {
          timer.resumeTimer();
        }
        if (data.type == "addMinute") {
          timer.addMinute();
        }
        if (data.type == "subtractMinute") {
          timer.subtractMinute();
        }
        if (data.type == "addSecond") {
          timer.addSecond();
        }
        if (data.type == "subtractSecond") {
          timer.subtractSecond();
        }

        // shotclock
        if (data.type == "startSC") {
          shotClock.startSC();
        }
        if (data.type == "pauseSC") {
          shotClock.pauseSC();
        }
        if (data.type == "resumeSC") {
          shotClock.resumeSC();
        }
        if (data.type == "resetTo24SC") {
          shotClock.resetTo24SC();
        }
        if (data.type == "resetTo14SC") {
          shotClock.resetTo14SC();
        }
        if (data.type == "addSecondSC") {
          shotClock.addSecondSC();
        }
        if (data.type == "subtractSecondSC") {
          shotClock.subtractSecondSC();
        }

        // MINI BOUT data
        if (data.type == "miniBout") {
          document.getElementById("rmxfrm").innerHTML = data.rmxfrm;
          document.getElementById("rmxfxf").innerHTML = data.rmxfxf;
          document.getElementById("rmtprm").innerHTML = data.rmtprm;
          document.getElementById("rmtptp").innerHTML = data.rmtptp;
          document.getElementById("tpxftp").innerHTML = data.tpxftp;
          document.getElementById("tpxfxf").innerHTML = data.tpxfxf;
          refreshCompletedBouts();
        }

        if (data.type == "fullScreenMiniBout") {
          let hideThese = document.querySelectorAll(".miniBoutHide");

          if (data.fullScreen == "true") {
            hideThese.forEach((el) => {
            el.classList.add("hidden");
          });

          document.getElementById("mini-bout-results-wrapper").classList.add("fullScreenMiniBout");
          refreshCompletedBouts();
          }

          if (data.fullScreen == "false") {
            hideThese.forEach((el) => {
            el.classList.remove("hidden");
          });

          document.getElementById("mini-bout-results-wrapper").classList.remove("fullScreenMiniBout");
          refreshCompletedBouts();
          }

          // hideThese.forEach((el) => {
          //   el.classList.toggle("hidden");
          // });

          // document.getElementById("mini-bout-results-wrapper").classList.toggle("fullScreenMiniBout");
        }
        
        // Handle pong response from the server (you need to handle this here)
        if (data.type === 'pong') {
          console.log('Received pong from server');
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    reader.readAsText(event.data);
  } else {
    // Handle other types of data
    //console.error("Unexpected data type:", typeof event.data);
    try {
      let data = JSON.parse(event.data);
      console.log("Parsed data:", data);

      // Handle pong response from the server
      if (data.type === 'pong') {
        console.log('Received pong from server');
      }
    } catch (error) {
      console.error("Error parsing non-Blob message:", error);
    }

  }
  
});
}


// begin Kipley testing

function fetchData(quiet = false) {
  fetch("/api/recentData") // Adjust the path if needed
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
      return response.json(); // Parse the response as JSON
    })
  .then((data) => {
      // Use the retrieved data
    console.log("Retrieved data:", data);
      useData(data); // Call a function to display the data
    })
  .catch((error) => {
    console.error("Error fetching data:", error);
    alert("Failed to retrieve data. Check the console.");
  });
}

function useData(data) {
  let team1Score = data.team1Score;
  let team2Score = data.team2Score;

  let team1Name = data.homeName;
  let team2Name = data.awayName;
  
  let roundNum = data.roundNum;
  let jamNum = data.jamNum;

  document.getElementById("team1-name").innerText = team1Name;
  switch (team1Name) {
  case "Thrash Pandas":
    document.getElementById(
      "team1Logo"
      ).innerHTML = `<img src="/images/thrashpandas-logo.png">`;
    break;
  case "X Force":
    document.getElementById(
      "team1Logo"
      ).innerHTML = `<img src="/images/xforce-logo.png">`;
    break;
  case "Riotmakers":
    document.getElementById(
      "team1Logo"
      ).innerHTML = `<img src="/images/riotmakers-logo.png">`;
    break;
  }
  switch (team1Name) {
  case "Thrash Pandas":
    document.getElementById("team1Section").classList.add("purple");
    document.getElementById("team1Section").classList.remove("yellow");
    document.getElementById("team1Section").classList.remove("green");
    break;
  case "X Force":
    document.getElementById("team1Section").classList.add("yellow");
    document.getElementById("team1Section").classList.remove("green");
    document.getElementById("team1Section").classList.remove("purple");
    break;
  case "Riotmakers":
    document.getElementById("team1Section").classList.add("green");
    document.getElementById("team1Section").classList.remove("purple");
    document.getElementById("team1Section").classList.remove("yellow");
    break;
  }

  document.getElementById("team2-name").innerText = team2Name;
  switch (team2Name) {
  case "Thrash Pandas":
    document.getElementById(
      "team2Logo"
      ).innerHTML = `<img src="/images/thrashpandas-logo.png">`;
    break;
  case "X Force":
    document.getElementById(
      "team2Logo"
      ).innerHTML = `<img src="/images/xforce-logo.png">`;
    break;
  case "Riotmakers":
    document.getElementById(
      "team2Logo"
      ).innerHTML = `<img src="/images/riotmakers-logo.png">`;
    break;
  }
  switch (team2Name) {
  case "Thrash Pandas":
    document.getElementById("team2Section").classList.add("purple");
    document.getElementById("team2Section").classList.remove("yellow");
    document.getElementById("team2Section").classList.remove("green");
    break;
  case "X Force":
    document.getElementById("team2Section").classList.add("yellow");
    document.getElementById("team2Section").classList.remove("green");
    document.getElementById("team2Section").classList.remove("purple");
    break;
  case "Riotmakers":
    document.getElementById("team2Section").classList.add("green");
    document.getElementById("team2Section").classList.remove("purple");
    document.getElementById("team2Section").classList.remove("yellow");
    break;
  }
  document.getElementById("team1-score").innerText = team1Score;
  document.getElementById("team2-score").innerText = team2Score;
  
  document.getElementById("roundNumDisplay").innerText = roundNum;
  document.getElementById("jamNumDisplay").innerText = jamNum;

  document.getElementById("rmxfrm").innerHTML = data.rmxfrm;
  document.getElementById("rmxfxf").innerHTML = data.rmxfxf;
  document.getElementById("rmtprm").innerHTML = data.rmtprm;
  document.getElementById("rmtptp").innerHTML = data.rmtptp;
  document.getElementById("tpxftp").innerHTML = data.tpxftp;
  document.getElementById("tpxfxf").innerHTML = data.tpxfxf;
  refreshCompletedBouts();
}

function scoreValue(el) {
  if (!el) return 0;
  const raw = (el.textContent || el.innerText || "").trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

function refreshCompletedBouts() {
  const wrapper = document.getElementById("mini-bout-results-wrapper");
  if (!wrapper) return;

  const pairings = [
    { block: "mini-bout-rm-xf", a: "rmxfrm", b: "rmxfxf" },
    { block: "mini-bout-rm-tp", a: "rmtprm", b: "rmtptp" },
    { block: "mini-bout-tp-xf", a: "tpxftp", b: "tpxfxf" },
  ];

  const completed = [];
  pairings.forEach((pair) => {
    const block = document.getElementById(pair.block);
    if (!block) return;
    const a = scoreValue(document.getElementById(pair.a));
    const b = scoreValue(document.getElementById(pair.b));
    const played = a !== 0 || b !== 0;
    block.classList.toggle("is-unplayed", !played);
    if (played) completed.push(block);
  });

  const fullScreen = wrapper.classList.contains("fullScreenMiniBout");
  // Live view: at most two completed pairings. Full screen shows all three.
  if (!fullScreen && completed.length > 2) {
    completed.slice(0, completed.length - 2).forEach((block) => {
      block.classList.add("is-unplayed");
    });
  }

  const visibleCount = fullScreen
    ? pairings.length
    : Math.min(completed.length, 2);

  wrapper.classList.toggle("has-completed", visibleCount > 0);
  wrapper.classList.remove("results-count-1", "results-count-2", "results-count-3");
  if (visibleCount > 0) {
    wrapper.classList.add(`results-count-${visibleCount}`);
  }
}

window.onload = (event) => {
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
