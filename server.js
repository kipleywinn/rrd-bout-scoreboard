const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Default data for a fresh start
const DEFAULT_DATA = {
  team1Name: "Payback",
  team2Name: "First Blood",
  team3Name: "Street Fight",
  team1Score: 0,
  team2Score: 0,
  team3Score: 0,
  roundNum: 1,
  jamNum: 1,
};

const DATA_FILE = path.join(__dirname, "recentData.json");

// Seed recentData.json if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  console.log("Created default recentData.json");
}

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/display.html"));
});

app.get("/control", (req, res) => {
  res.sendFile(path.join(__dirname, "public/control.html"));
});

app.post("/saveData", (req, res) => {
  const jsonData = req.body;
  console.log("Saving data:", jsonData);

  fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      console.error("Error writing to file:", err);
      return res.status(500).json({ error: "Failed to save data." });
    }
    console.log("Data saved successfully.");
    res.json({ message: "Data saved successfully." });
  });
});

app.get("/api/recentData", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).json({ error: "Failed to read data." });
    }
    try {
      res.json(JSON.parse(data));
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return res.status(500).json({ error: "Invalid JSON data." });
    }
  });
});

// WebSocket server
wss.on("connection", (ws) => {
  console.log("Client connected");

  // Send current state to newly connected client
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading recentData.json:", err);
    } else {
      try {
        const jsonData = JSON.parse(data);
        ws.send(JSON.stringify({ type: "initialData", payload: jsonData }));
      } catch (parseErr) {
        console.error("Error parsing recentData.json:", parseErr);
      }
    }
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "ping") {
        console.log("Received ping from client");
        ws.send(JSON.stringify({ type: "pong" }));
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }

    console.log("Received message:", message.toString());

    // Broadcast to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
