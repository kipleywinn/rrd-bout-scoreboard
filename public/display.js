// --- Global Variables (Initialized to 0 to ensure Chart.js doesn't try to plot undefined) ---
// Note: Initializing scores to 0 prevents issues when fetchData runs asynchronously.
let team1Score = 0;
let team2Score = 0;
let team3Score = 0;
let team4Score = 0;
let team5Score = 0;
let myChart; // Global chart variable for access by WebSocket

// --- Chart Helper Functions ---

/**
 * Calculates the suggested maximum value for the X-axis to ensure data labels have room.
 * @returns {number} The suggested maximum value for the X-axis.
 */
function getMaxScore() {
  const scores = [team1Score, team2Score, team3Score, team4Score, team5Score];
  const maxScore = Math.max(...scores);
  // Ensure the scale is at least 20 if all scores are low, otherwise add 10% padding to the max score
  // return Math.max(10, maxScore * 1.1);
  return (maxScore + 0);
}

/**
 * Updates the chart dataset with the current global score variables and redraws the chart.
 */
const updateChart = () => {
  // Safety check to ensure the chart is ready
  if (!myChart || !myChart.data || !myChart.data.datasets || myChart.data.datasets.length === 0) {
    console.warn("Chart not yet initialized or missing data structure.");
    return;
  }

  // Get the current global scores
  const newScores = [team1Score, team2Score, team3Score, team4Score, team5Score];

  // 1. Update the chart's data array
  myChart.data.datasets[0].data = newScores;

  // 2. Add dynamic X-axis scaling to account for growing scores and labels
  myChart.options.scales.x.suggestedMax = getMaxScore();

  // 3. Call the update method to redraw the chart with animation
  myChart.update();
};

// --- WebSocket Connection Setup (Consolidated into a function for better practice) ---

const initWebSocket = () => {
  let wsProtocol = "ws:";
  let wsHost = window.location.host;

  if (window.location.protocol === "https:") {
    wsProtocol = "wss:";
  }

  const wsUrl = `${wsProtocol}//${wsHost}`;
  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WebSocket connection established.");
  };

  socket.onerror = (error) => {
    console.error("WebSocket Error: ", error);
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed.");
  };

  // Keepalive ping every 25 seconds
  setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "ping" }));
    }
  }, 25000);

  /**
   * Processes incoming WebSocket data, updates global scores, and triggers the chart update.
   * @param {Object} data - Parsed JSON object from the server.
   */
  const processMessage = (data) => {
    let scoreChanged = false;

    // Update scores and set flag
    if (data.type == "team1Point") { team1Score = data.team1Score; scoreChanged = true; }
    if (data.type == "team2Point") { team2Score = data.team2Score; scoreChanged = true; }
    if (data.type == "team3Point") { team3Score = data.team3Score; scoreChanged = true; }
    if (data.type == "team4Point") { team4Score = data.team4Score; scoreChanged = true; }
    if (data.type == "team5Point") { team5Score = data.team5Score; scoreChanged = true; }

    // Update display elements (if they exist in the HTML)
    const roundEl = document.getElementById("roundNumDisplay");
    if (data.type == "roundNum" && roundEl) roundEl.innerText = data.roundNum;

    const jamEl = document.getElementById("jamNumDisplay");
    if (data.type == "jamNum" && jamEl) jamEl.innerText = data.jamNum;

    if (data.type === 'pong') {
      console.log('Received pong from server');
    }

    // Trigger chart update ONCE after all score changes have been processed.
    if (scoreChanged && myChart) {
      updateChart();
    }
  };

  // Handle incoming WebSocket messages
  socket.addEventListener("message", (event) => {
    const handleData = (text) => {
      try {
        const data = JSON.parse(text);
        processMessage(data);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    if (event.data instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => handleData(reader.result);
      reader.readAsText(event.data);
    } else {
      handleData(event.data);
    }
  });
};

// --- Initial Data Fetch Functions ---

function fetchData() {
  fetch("/api/recentData")
      .then((response) => {
        if (!response.ok) {
          console.error("API call failed, status:", response.status);
          return {};
        }
        return response.json();
      })
      .then((data) => {
        console.log("Retrieved initial data:", data);
        useData(data);
      })
      .catch((error) => {
        console.error("Error fetching initial data:", error);
      });
}

/**
 * Updates global score and display variables based on fetched data.
 * @param {Object} data - Initial data object from the fetch API.
 */
function useData(data) {
  // Use || 0 to ensure scores are always numbers, using the current value as fallback
  team1Score = data.team1Score || 0;
  team2Score = data.team2Score || 0;
  team3Score = data.team3Score || 0;
  team4Score = data.team4Score || 0;
  team5Score = data.team5Score || 0;

  // Update display elements
  const roundEl = document.getElementById("roundNumDisplay");
  if (roundEl) roundEl.innerText = data.roundNum || '0';

  const jamEl = document.getElementById("jamNumDisplay");
  if (jamEl) jamEl.innerText = data.jamNum || '0';

  // Initial chart render only if the chart has been initialized
  if (myChart) {
    updateChart();
  }
}

// --- Chart Initialization ---

const initChart = () => {
  // CRITICAL CHECK: Ensure ChartDataLabels is defined!
  if (typeof ChartDataLabels === 'undefined') {
    console.error("--- PLUGIN FAILURE ---");
    console.error("The ChartDataLabels plugin is undefined. Data labels on the bars will NOT appear.");
    console.error("------------------------");
  } else {
    console.log("ChartDataLabels plugin found and successfully registered.");
    Chart.register(ChartDataLabels);
  }

  let ctx = document.getElementById('vamparty-scores')?.getContext('2d');

  if (!ctx) {
    console.error("Could not find canvas element with ID 'vamparty-scores'.");
    return;
  }

  const barColors = [
    'rgba(5, 8, 8, 1.0)',     // Blade: #050808 (1.0 alpha)
    'rgba(127, 47, 50, 1.0)', // True Blood: #7f2f32 (1.0 alpha)
    'rgba(155, 120, 13, 1.0)',// Twilight: #9b780d (1.0 alpha)
    'rgba(13, 38, 113, 1.0)', // Vampire Chronicles: #0d2671 (1.0 alpha)
    'rgba(15, 71, 15, 1.0)'   // WWDITS: #0f470f (1.0 alpha)
  ];

  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [
          'Blade',
          'True Blood',
          'Twilight',
          ['Vampire', 'Chronicles'],
          ['What We Do', 'In The Shadows']
      ],
      datasets: [{
        label: 'Score',
        data: [team1Score, team2Score, team3Score, team4Score, team5Score],
        backgroundColor: barColors,
        borderColor: barColors,
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 500,
        easing: 'easeOutQuart',
      },
      scales: {
        x: {
          beginAtZero: true,
          suggestedMax: getMaxScore(),
          title: {
            display: false,
            text: 'Team Score',
            font: { size: 14, weight: 'bold' }
          },
          ticks: {
            display: false,
            precision: 0
          },
          grid: {
            display: false
          }
        },
        y: {
          ticks: {
            display: false,
            color: '#cccaca',
            font: {
              size: 24, // **Team Name Font Size**
              weight: 'bold'
            }
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false,
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          padding: 12,
          cornerRadius: 8,
        },
        datalabels: {
          anchor: 'end',
          align: 'left',
          offset: 10,
          clamp: true,
          color: '#cccaca',
          font: {
            //weight: 'bold', // **Score Font Weight**
            size: 60, // **Score Font Size**
            family: 'A Love of Thunder'
          },
          formatter: (value, context) => {
            return value;
          }
        }
      }
    }
  });
};

// Main application initialization sequence
window.onload = (event) => {
  // 1. Start the WebSocket connection
  initWebSocket();

  // 2. Fetch initial data to set scores
  fetchData();

  // 3. Initialize the chart
  initChart();
};
