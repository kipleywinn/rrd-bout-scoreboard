// const socket = new WebSocket(`wss://${window.location.host}`);

let wsProtocol = "ws:"; // Default to unsecure WebSocket for development
let wsHost = window.location.host; // Use the current page's host (e.g., localhost:3000 or your-domain.com)

// If the page itself is loaded over HTTPS, use wss for the WebSocket
if (window.location.protocol === "https:") {
    wsProtocol = "wss:";
}

// Construct the full WebSocket URL
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
}, 25000); // 25 seconds


// new function writing to JSON to store current data?
// see here: https://www.geeksforgeeks.org/how-to-update-data-in-json-file-using-javascript/

function writeTheData() {
  const data = {
    team1Score,
    team2Score,
    team3Score,
    team4Score,
    team5Score,
    roundNum,
    jamNum,
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
  team3Score = parseInt(data.team3Score);
  team4Score = parseInt(data.team4Score);
  team5Score = parseInt(data.team5Score);
  
  roundNum = parseInt(data.roundNum);
  jamNum = parseInt(data.jamNum);

  socket.send(
    JSON.stringify({
      type: "team1Point",
      team1Score,
    })
  );
  socket.send(
    JSON.stringify({
      type: "team2Point",
      team2Score,
    })
  );
  socket.send(
      JSON.stringify({
        type: "team3Point",
        team3Score,
      })
  );
  socket.send(
      JSON.stringify({
        type: "team4Point",
        team4Score,
      })
  );
  socket.send(
      JSON.stringify({
        type: "team5Point",
        team5Score,
      })
  );
  
  socket.send(
    JSON.stringify({
      type: "roundNum",
      roundNum,
    })
  );
  
  socket.send(
    JSON.stringify({
      type: "jamNum",
      jamNum,
    })
  );

  document.getElementById("override-team1-score-input").value = team1Score;
  document.getElementById("override-team2-score-input").value = team2Score;
  document.getElementById("override-team3-score-input").value = team3Score;
  document.getElementById("override-team4-score-input").value = team4Score;
  document.getElementById("override-team5-score-input").value = team5Score;
  
  document.getElementById("roundNum").value = roundNum;
  document.getElementById("jamNum").value = jamNum;

}

// Variables for the scoring
let team1Score;
let team2Score;
let team3Score;
let team4Score;
let team5Score;


// Variables for round & jam
let roundNum = 1;
let jamNum = 1;


// Override score totals and manually set score
function overrideScore(team) {
  if (team === 1) {
    team1Score = document.getElementById("override-team1-score-input").value;
    socket.send(
      JSON.stringify({
        type: "team1Point",
        team1Score,
      })
    );
  }
  if (team === 2) {
    team2Score = document.getElementById("override-team2-score-input").value;
    socket.send(
      JSON.stringify({
        type: "team2Point",
        team2Score,
      })
    );
  }
  if (team === 3) {
    team3Score = document.getElementById("override-team3-score-input").value;
    socket.send(
        JSON.stringify({
          type: "team3Point",
          team3Score,
        })
    );
  }
  if (team === 4) {
    team4Score = document.getElementById("override-team4-score-input").value;
    socket.send(
        JSON.stringify({
          type: "team4Point",
          team4Score,
        })
    );
  }
  if (team === 5) {
    team5Score = document.getElementById("override-team5-score-input").value;
    socket.send(
        JSON.stringify({
          type: "team5Point",
          team5Score,
        })
    );
  }

  writeTheData();
}

// Override round or jam
function overrideRoundJam(item) {
  // item 1 is round
  if (item === 1) {
    roundNum = document.getElementById("roundNum").value;
    socket.send(
      JSON.stringify({
        type: "roundNum",
        roundNum,
      })
    );
  }
  // item 2 is jam
  if (item === 2) {
    jamNum = document.getElementById("jamNum").value;
    socket.send(
      JSON.stringify({
        type: "jamNum",
        jamNum,
      })
    );
  }
  writeTheData();
}

// Reset scores
function resetScore() {
  team1Score = 0;
  team2Score = 0;
  team3Score = 0;
  team4Score = 0;
  team5Score = 0;
  roundNum = 1;
  jamNum = 1;

  socket.send(
    JSON.stringify({
      type: "team1Point",
      team1Score,
    })
  );
  socket.send(
    JSON.stringify({
      type: "team2Point",
      team2Score,
    })
  );
  socket.send(
      JSON.stringify({
        type: "team3Point",
        team3Score,
      })
  );
  socket.send(
      JSON.stringify({
        type: "team4Point",
        team4Score,
      })
  );
  socket.send(
      JSON.stringify({
        type: "team5Point",
        team5Score,
      })
  );
  
  socket.send(
    JSON.stringify({
      type: "roundNum",
      roundNum,
    })
  );
  
  socket.send(
    JSON.stringify({
      type: "jamNum",
      jamNum,
    })
  );
  
  document.getElementById("override-team1-score-input").value = team1Score;
  document.getElementById("override-team2-score-input").value = team2Score;
  document.getElementById("override-team3-score-input").value = team3Score;
  document.getElementById("override-team4-score-input").value = team4Score;
  document.getElementById("override-team5-score-input").value = team5Score;
  
  document.getElementById("roundNum").value = roundNum;
  document.getElementById("jamNum").value = jamNum;
  
  writeTheData();
}

document
  .getElementById("override-team1-score-input")
  .addEventListener("input", () => overrideScore(1));
document
  .getElementById("minus1")
  .addEventListener("click", () => overrideScore(1));
document
  .getElementById("plus1")
  .addEventListener("click", () => overrideScore(1));

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
    .getElementById("override-team3-score-input")
    .addEventListener("input", () => overrideScore(3));
document
    .getElementById("minus5")
    .addEventListener("click", () => overrideScore(3));
document
    .getElementById("plus5")
    .addEventListener("click", () => overrideScore(3));

document
    .getElementById("override-team4-score-input")
    .addEventListener("input", () => overrideScore(4));
document
    .getElementById("minus6")
    .addEventListener("click", () => overrideScore(4));
document
    .getElementById("plus6")
    .addEventListener("click", () => overrideScore(4));

document
    .getElementById("override-team5-score-input")
    .addEventListener("input", () => overrideScore(5));
document
    .getElementById("minus7")
    .addEventListener("click", () => overrideScore(5));
document
    .getElementById("plus7")
    .addEventListener("click", () => overrideScore(5));

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

document
  .getElementById("resetScore")
  .addEventListener("click", () => resetScore());


window.addEventListener('load', function() {
  setTimeout(function() {
    // Your event listener code here
    console.log('5 seconds have passed after window load!');
    fetchData();
    
  }, 2000); // 5000 milliseconds = 5 seconds
});
