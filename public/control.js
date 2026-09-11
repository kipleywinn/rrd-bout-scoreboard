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
  console.log(`Reconnecting control WebSocket in ${delay}ms`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectWebSocket();
  }, delay);
}

function connectWebSocket() {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  console.log("Connecting control WebSocket to", wsUrl);
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WebSocket connection established");
    reconnectDelay = 1000;
    clearReconnectTimer();
  };

  socket.onerror = (error) => {
    console.error("WebSocket Error: ", error);
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
    scheduleReconnect();
  };

  socket.onmessage = function (event) {
    console.log("Data from server: ", event.data);
  };
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

function sendJson(payload) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
    return true;
  }
  console.warn("WebSocket not connected; skipped send", payload);
  ensureConnected();
  return false;
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    ensureConnected();
  }
});

window.addEventListener("online", () => {
  ensureConnected();
});

window.addEventListener("focus", () => {
  ensureConnected();
});

connectWebSocket();

setInterval(() => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "ping" }));
  } else if (document.visibilityState === "visible") {
    ensureConnected();
  }
}, 25000);


// new function writing to JSON to store current data?
// see here: https://www.geeksforgeeks.org/how-to-update-data-in-json-file-using-javascript/

function writeTheData() {
  const data = {
    homeName,
    awayName,
    team1Score,
    team2Score,
    roundNum,
    jamNum,
    rmxfrm,
    rmxfxf,
    rmtprm,
    rmtptp,
    tpxftp,
    tpxfxf
  };

  console.log(data);

  fetch("/saveData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result); // Log the server's response
      console.log(JSON.stringify(result)); //display the result to the user.
    })
    .catch((error) => {
      console.error("Error:", error);
      console.log("An error occurred. Check the console.");
    });
}

function fetchData() {
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
  team1Score = parseInt(data.team1Score);
  team2Score = parseInt(data.team2Score);

  homeName = data.homeName;
  awayName = data.awayName;
  
  roundNum = parseInt(data.roundNum);
  jamNum = parseInt(data.jamNum);

  rmxfrm = parseInt(data.rmxfrm);
  rmxfxf = parseInt(data.rmxfxf);
  rmtprm = parseInt(data.rmtprm);
  rmtptp = parseInt(data.rmtptp);
  tpxftp = parseInt(data.tpxftp);
  tpxfxf = parseInt(data.tpxfxf);

  sendJson({
      type: "team1Point",
      team1Score,
    });

  sendJson({
      type: "team2Point",
      team2Score,
    });
  
  sendJson({
      type: "roundNum",
      roundNum,
    });
  
  sendJson({
      type: "jamNum",
      jamNum,
    });

  sendJson({
      type: "updateName1",
      team1Name: homeName,
    });
  document.getElementById("display-team1-name-controls").innerHTML = homeName;

  sendJson({
      type: "updateName2",
      team2Name: awayName,
    });

  sendJson({
      type: "miniBout",
      rmxfrm,
      rmxfxf,
      rmtprm,
      rmtptp,
      tpxftp,
      tpxfxf,
    });

  document.querySelector("#rmxfrm input").value = rmxfrm;
  document.querySelector("#rmxfxf input").value = rmxfxf;
  document.querySelector("#rmtprm input").value = rmtprm;
  document.querySelector("#rmtptp input").value = rmtptp;
  document.querySelector("#tpxftp input").value = tpxftp;
  document.querySelector("#tpxfxf input").value = tpxfxf;



  document.getElementById("display-team2-name-controls").innerHTML = awayName;

  document.getElementById("override-team1-score-input").value = team1Score;
  document.getElementById("override-team2-score-input").value = team2Score;
  
  document.getElementById("roundNum").value = roundNum;
  document.getElementById("jamNum").value = jamNum;

  switch (homeName) {
    case "Thrash Pandas":
      document.getElementById("team1-name-input").value = "thrashPandas";
      break;
    case "X Force":
      document.getElementById("team1-name-input").value = "xForce";
      break;
    case "Riotmakers":
      document.getElementById("team1-name-input").value = "riotmakers";
      break;
  }
  switch (awayName) {
    case "Thrash Pandas":
      document.getElementById("team2-name-input").value = "thrashPandas";
      break;
    case "X Force":
      document.getElementById("team2-name-input").value = "xForce";
      break;
    case "Riotmakers":
      document.getElementById("team2-name-input").value = "riotmakers";
      break;
  }
  colorSwitcher();
}

// Variables for the scoring
let team1Score;
let team2Score;

// Variables for the names
let homeName;
let awayName;

// Variables for round & jam
let roundNum = 1;
let jamNum = 1;

// Mini bout variables
  let rmxfrm = 0;
  let rmxfxf = 0;
  let rmtprm = 0;
  let rmtptp = 0;
  let tpxftp = 0;
  let tpxfxf = 0;

// Update scoreboard display and send updates via WebSocket
function updateScoreboard() {
  const data = {
    type: "update",
    team1Name: homeName,
    team2Name: awayName,
    team1Score: team1Score,
    team2Score: team2Score,
    roundNum: roundNum,
    jamNum: jamNum,
    timer: document.getElementById("timer").innerText,
    shotClockTimer: document.getElementById("shotClockTimer").innerText,
  };
  console.log("Sending update:", data);
  sendJson(data);
}

// Override score totals and manually set score
function overrideScore(team) {
  if (team === 1) {
    team1Score = document.getElementById("override-team1-score-input").value;
    sendJson({
        type: "team1Point",
        team1Score,
      });
  }
  if (team === 2) {
    team2Score = document.getElementById("override-team2-score-input").value;
    sendJson({
        type: "team2Point",
        team2Score,
      });
  }
  writeTheData();
}

function updateMiniBout() {
  rmxfrm = document.querySelector("#rmxfrm input").value;
  rmxfxf = document.querySelector("#rmxfxf input").value;
  rmtprm = document.querySelector("#rmtprm input").value;
  rmtptp = document.querySelector("#rmtptp input").value;
  tpxftp = document.querySelector("#tpxftp input").value;
  tpxfxf = document.querySelector("#tpxfxf input").value;

  sendJson({
      type: "miniBout",
      rmxfrm,
      rmxfxf,
      rmtprm,
      rmtptp,
      tpxftp,
      tpxfxf,
    });

  writeTheData();
}

function miniBoutFullScreen() {
  sendJson({
      type: "fullScreenMiniBout",
      fullScreen: "true",
    });
}

function miniBoutTinyScreen() {
  sendJson({
      type: "fullScreenMiniBout",
      fullScreen: "false",
    });
}

function toggleHiddenButtons() {
  let fullButton = document.getElementById("miniBoutFullScreen");
  let tinyButton = document.getElementById("miniBoutTinyScreen");

  fullButton.classList.toggle("hidden");
  tinyButton.classList.toggle("hidden");
}

// Override round or jam
function overrideRoundJam(item) {
  // item 1 is round
  if (item === 1) {
    roundNum = document.getElementById("roundNum").value;
    sendJson({
        type: "roundNum",
        roundNum,
      });
  }
  // item 2 is jam
  if (item === 2) {
    jamNum = document.getElementById("jamNum").value;
    sendJson({
        type: "jamNum",
        jamNum,
      });
  }
  writeTheData();
}

function normalizeTeamName(name) {
  return (name || "").trim().toLowerCase();
}

function pairingKey(nameA, nameB) {
  const set = new Set([normalizeTeamName(nameA), normalizeTeamName(nameB)]);
  const has = (n) => set.has(n);
  if (has("riotmakers") && has("x force")) return "rm-xf";
  if (has("riotmakers") && has("thrash pandas")) return "rm-tp";
  if (has("thrash pandas") && has("x force")) return "tp-xf";
  return null;
}

function boutOver() {
  const liveHome = homeName;
  const liveAway = awayName;
  const homeScore = parseFloat(team1Score) || 0;
  const awayScore = parseFloat(team2Score) || 0;
  const key = pairingKey(liveHome, liveAway);

  if (!key) {
    alert("Set both teams to Riotmakers, X Force, or Thrash Pandas before ending the bout.");
    return;
  }

  const assign = (homeIs, slotHome, slotAway) => {
    if (normalizeTeamName(liveHome) === homeIs) {
      document.querySelector(slotHome).value = homeScore;
      document.querySelector(slotAway).value = awayScore;
    } else {
      document.querySelector(slotHome).value = awayScore;
      document.querySelector(slotAway).value = homeScore;
    }
  };

  if (key === "rm-xf") {
    assign("riotmakers", "#rmxfrm input", "#rmxfxf input");
  } else if (key === "rm-tp") {
    assign("riotmakers", "#rmtprm input", "#rmtptp input");
  } else if (key === "tp-xf") {
    assign("thrash pandas", "#tpxftp input", "#tpxfxf input");
  }

  updateMiniBout();
  resetScore();
}

// Reset scores
function resetScore() {
  team1Score = 0;
  team2Score = 0;
  roundNum = 1;
  jamNum = 1;
  sendJson({
      type: "team1Point",
      team1Score,
    });

  sendJson({
      type: "team2Point",
      team2Score,
    });
  
  sendJson({
      type: "roundNum",
      roundNum,
    });
  
  sendJson({
      type: "jamNum",
      jamNum,
    });
  
  document.getElementById("override-team1-score-input").value = team1Score;
  document.getElementById("override-team2-score-input").value = team2Score;
  
  document.getElementById("roundNum").value = roundNum;
  document.getElementById("jamNum").value = jamNum;
  
  writeTheData();
}

// Update team names
function updateTeamName(team) {
  let displayName;
  if (team === 1) {
    displayName = document.getElementById("display-team1-name-controls");
    const newName =
      document.getElementById("team1-name-input").options[
        document.getElementById("team1-name-input").selectedIndex
      ].text;

    if (newName) {
      homeName = newName;
      document.getElementById("display-team1-name-controls").innerHTML =
        newName;
      //check display name
      if (displayName) {
        displayName.innerText = homeName;
      } else {
        console.error("No display name");
      }
      sendJson({
          type: "updateName1",
          team1Name: homeName,
        });
    }
  } else if (team === 2) {
    displayName = document.getElementById("display-team2-name-controls");
    const newName =
      document.getElementById("team2-name-input").options[
        document.getElementById("team2-name-input").selectedIndex
      ].text;

    if (newName) {
      awayName = newName;
      document.getElementById("display-team2-name-controls").innerHTML =
        newName;
      //check display name
      if (displayName) {
        displayName.innerText = awayName;
      } else {
        console.error("No display name");
      }

      sendJson({
          type: "updateName2",
          team2Name: awayName,
        });
    }
  }
  writeTheData();
}

// Reset team names
function resetTeamName() {
  homeName = "Team 1";
  awayName = "Team 2";

  // Check if the team name have been updated
  let placeholderTeam1 = document.getElementById("team1-name-input").value;
  let placeholderTeam2 = document.getElementById("team2-name-input").value;

  if (placeholderTeam1) {
    placeholderTeam1 = homeName;
    document.getElementById("team1-name-input").value = "team1";
    document.getElementById("display-team1-name-controls").innerHTML = homeName;
    sendJson({
        type: "updateName1",
        team1Name: placeholderTeam1,
      });
  }
  if (placeholderTeam2) {
    placeholderTeam2 = awayName;
    document.getElementById("team2-name-input").value = "team2";
    document.getElementById("display-team2-name-controls").innerHTML = awayName;
    sendJson({
        type: "updateName2",
        team2Name: placeholderTeam2,
      });
  }

  document.querySelector(".scoreBoardSetterA").classList.remove("purpleback");
  document.querySelector(".scoreBoardSetterA").classList.remove("yellowback");
  document.querySelector(".scoreBoardSetterA").classList.remove("greenback");
  
  document.querySelector(".scoreBoardSetterB").classList.remove("purpleback");
  document.querySelector(".scoreBoardSetterB").classList.remove("yellowback");
  document.querySelector(".scoreBoardSetterB").classList.remove("greenback");
  
  writeTheData();
  disableTeamName();
}

// Can't choose same team for both options
function disableTeamName() {
  let team1Select = document.getElementById("team1-name-input");
  let team2Select = document.getElementById("team2-name-input");

  switch (team1Select.value) {
    case "thrashPandas":
      team2Select[0].disabled = false;
      team2Select[1].disabled = true;
      team2Select[2].disabled = false;
      team2Select[3].disabled = false;
      break;
    case "xForce":
      team2Select[0].disabled = false;
      team2Select[1].disabled = false;
      team2Select[2].disabled = true;
      team2Select[3].disabled = false;
      break;
    case "riotmakers":
      team2Select[0].disabled = false;
      team2Select[1].disabled = false;
      team2Select[2].disabled = false;
      team2Select[3].disabled = true;
      break;
    default:
      team2Select[0].disabled = false;
      team2Select[1].disabled = false;
      team2Select[2].disabled = false;
      team2Select[3].disabled = false;
      break;
  }

  switch (team2Select.value) {
    case "thrashPandas":
      team1Select[0].disabled = false;
      team1Select[1].disabled = true;
      team1Select[2].disabled = false;
      team1Select[3].disabled = false;
      break;
    case "xForce":
      team1Select[0].disabled = false;
      team1Select[1].disabled = false;
      team1Select[2].disabled = true;
      team1Select[3].disabled = false;
      break;
    case "riotmakers":
      team1Select[0].disabled = false;
      team1Select[1].disabled = false;
      team1Select[2].disabled = false;
      team1Select[3].disabled = true;
      break;
    default:
      team1Select[0].disabled = false;
      team1Select[1].disabled = false;
      team1Select[2].disabled = false;
      team1Select[3].disabled = false;
      break;
  }
}

// function to switch background color to team color
function colorSwitcher() {
  let team1Name = document.getElementById("team1-name-input").value;
  let team2Name = document.getElementById("team2-name-input").value;

  switch (team1Name) {
    case "thrashPandas":
      document.querySelector(".scoreBoardSetterA").classList.add("purpleback");
      document
        .querySelector(".scoreBoardSetterA")
        .classList.remove("yellowback");
      document
        .querySelector(".scoreBoardSetterA")
        .classList.remove("greenback");
      break;
    case "xForce":
      document.querySelector(".scoreBoardSetterA").classList.add("yellowback");
      document
        .querySelector(".scoreBoardSetterA")
        .classList.remove("greenback");
      document
        .querySelector(".scoreBoardSetterA")
        .classList.remove("purpleback");
      break;
    case "riotmakers":
      document.querySelector(".scoreBoardSetterA").classList.add("greenback");
      document
        .querySelector(".scoreBoardSetterA")
        .classList.remove("purpleback");
      document
        .querySelector(".scoreBoardSetterA")
        .classList.remove("yellowback");
      break;
  }
  switch (team2Name) {
    case "thrashPandas":
      document.querySelector(".scoreBoardSetterB").classList.add("purpleback");
      document
        .querySelector(".scoreBoardSetterB")
        .classList.remove("yellowback");
      document
        .querySelector(".scoreBoardSetterB")
        .classList.remove("greenback");
      break;
    case "xForce":
      document.querySelector(".scoreBoardSetterB").classList.add("yellowback");
      document
        .querySelector(".scoreBoardSetterB")
        .classList.remove("greenback");
      document
        .querySelector(".scoreBoardSetterB")
        .classList.remove("purpleback");
      break;
    case "riotmakers":
      document.querySelector(".scoreBoardSetterB").classList.add("greenback");
      document
        .querySelector(".scoreBoardSetterB")
        .classList.remove("purpleback");
      document
        .querySelector(".scoreBoardSetterB")
        .classList.remove("yellowback");
      break;
  }
}

// Export scoreboard to Excel
/* async function exportScoreboard() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Scoreboard');
    
    const header = worksheet.addRow(['Team', 'Score']);
    worksheet.addRow([homeName, team1Score]);
    worksheet.addRow([awayName, team2Score]);

    header.eachCell(cell => {
        cell.font = { bold: true };
    });

    if (team1Score > team2Score) {
        const winnerCell = worksheet.addRow(['Winner!']);
        worksheet.addRow([homeName, team1Score]);

        winnerCell.eachCell(cell => {
            cell.font = { bold: true };
        });
    } else if (team2Score > team1Score) {
        const winnerCell = worksheet.addRow(['Winner!']);
        worksheet.addRow([awayName, team2Score]);

        winnerCell.eachCell(cell => {
            cell.font = { bold: true };
        });
    } else if (team1Score === team2Score) {
        const tieCell = worksheet.addRow(['Tie!']);
        tieCell.eachCell(cell => {
            cell.font = { bold: true };
        });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${homeName}_${awayName}_scoreboard.xlsx`;
    link.click();

    URL.revokeObjectURL(url);
}*/



// Event listeners for buttons
/*document
  .getElementById("add-team1-point")
  .addEventListener("click", () => addPoint(1));
document
  .getElementById("subtract-team1-point")
  .addEventListener("click", () => removePoint(1));*/


// document
//   .getElementById("override-team1-score")
//   .addEventListener("click", () => overrideScore(1));
document
  .getElementById("override-team1-score-input")
  .addEventListener("input", () => overrideScore(1));
document
  .getElementById("minus1")
  .addEventListener("click", () => overrideScore(1));
document
  .getElementById("plus1")
  .addEventListener("click", () => overrideScore(1));
/*document
  .getElementById("add-team2-point")
  .addEventListener("click", () => addPoint(2));
document
  .getElementById("subtract-team2-point")
  .addEventListener("click", () => removePoint(2));*/


// document
//   .getElementById("override-team2-score")
//   .addEventListener("click", () => overrideScore(2));
document
  .getElementById("override-team2-score-input")
  .addEventListener("input", () => overrideScore(2));
document
  .getElementById("minus2")
  .addEventListener("click", () => overrideScore(2));
document
  .getElementById("plus2")
  .addEventListener("click", () => overrideScore(2));


document
  .getElementById("roundNum")
  .addEventListener("input", () => overrideRoundJam(1));
document
  .getElementById("minus3")
  .addEventListener("click", () => overrideRoundJam(1));
document
  .getElementById("plus3")
  .addEventListener("click", () => overrideRoundJam(1));

document
  .getElementById("jamNum")
  .addEventListener("input", () => overrideRoundJam(2));
document
  .getElementById("minus4")
  .addEventListener("click", () => overrideRoundJam(2));
document
  .getElementById("plus4")
  .addEventListener("click", () => overrideRoundJam(2));



/*document
  .getElementById("update-team1-name")
  .addEventListener("click", () => updateTeamName(1));
document
  .getElementById("update-team2-name")
  .addEventListener("click", () => updateTeamName(2));*/
document
  .getElementById("resetTeamName")
  .addEventListener("click", () => resetTeamName());
document
  .getElementById("resetScore")
  .addEventListener("click", () => resetScore());
document.getElementById("team1-name-input").addEventListener("change", () => {
  updateTeamName(1);
  colorSwitcher();
  disableTeamName();
});
document.getElementById("team2-name-input").addEventListener("change", () => {
  updateTeamName(2);
  colorSwitcher();
  disableTeamName();
});


document.querySelector("#rmxfrm input").addEventListener("input", () => updateMiniBout());
document.querySelector("#rmxfxf input").addEventListener("input", () => updateMiniBout());
document.querySelector("#rmtprm input").addEventListener("input", () => updateMiniBout());
document.querySelector("#rmtptp input").addEventListener("input", () => updateMiniBout());
document.querySelector("#tpxftp input").addEventListener("input", () => updateMiniBout());
document.querySelector("#tpxfxf input").addEventListener("input", () => updateMiniBout());

document.getElementById("miniBoutFullScreen").addEventListener("click", () => miniBoutFullScreen());
document.getElementById("miniBoutTinyScreen").addEventListener("click", () => miniBoutTinyScreen());

document.getElementById("miniBoutFullScreen").addEventListener("click", () => toggleHiddenButtons());
document.getElementById("miniBoutTinyScreen").addEventListener("click", () => toggleHiddenButtons());


//document.getElementById('exportScoreboard').addEventListener('click', () =>exportScoreboard());

//timer
/*document.getElementById('startButton').addEventListener('click', () => {
    sendJson({ type: 'start' }); 
});

document.getElementById('pauseButton').addEventListener('click', () => {
    sendJson({ type: 'pause' }); 
});

document.getElementById('resetButton').addEventListener('click', () => {
    sendJson({ type: 'reset' }); 
});

document.getElementById('resumeButton').addEventListener('click', () => {
    sendJson({ type: 'resume' }); 
});
document.getElementById('addMinute').addEventListener('click', () => {
    sendJson({ type: 'addMinute' }); 
});
document.getElementById('addSecond').addEventListener('click', () => {
    sendJson({ type: 'addSecond' }); 
});
document.getElementById('subtractMinute').addEventListener('click', () => {
    sendJson({ type: 'subtractMinute' }); 
});
document.getElementById('subtractSecond').addEventListener('click', () => {
    sendJson({ type: 'subtractSecond' }); 
});

// shotclock
/*document.getElementById('startSC').addEventListener('click', () => {
    sendJson({ type: 'startSC' });
});

document.getElementById('pauseSC').addEventListener('click', () => {
    sendJson({ type: 'pauseSC' }); 
});

document.getElementById('resumeSC').addEventListener('click', () => {
    sendJson({ type: 'resumeSC' }); 
});

document.getElementById('resetTo24SC').addEventListener('click', () => {
    sendJson({ type: 'resetTo24SC' }); 
});

document.getElementById('resetTo14SC').addEventListener('click', () => {
    sendJson({ type: 'resetTo14SC' }); 
});

document.getElementById('addSecondSC').addEventListener('click', () => {
    sendJson({ type: 'addSecondSC' }); 
});

document.getElementById('subtractSecondSC').addEventListener('click', () => {
    sendJson({ type: 'subtractSecondSC' }); 
});*/


window.addEventListener('load', function() {
  setTimeout(function() {
    // Your event listener code here
    console.log('5 seconds have passed after window load!');
    fetchData();
    
  }, 2000); // 5000 milliseconds = 5 seconds
});
