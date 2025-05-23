const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // Add middleware to parse JSON requests

// Define routes for your HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/display.html"));
});

app.get("/control", (req, res) => {
  res.sendFile(path.join(__dirname, "public/control.html"));
});

/*app.post('/write-json', (req, res) => {
  let data = req.body;
  const filePath = path.join(__dirname, 'recentData.json');
  
  fs.writeFile(filePath, JSON.stringify(data), (err) => {
    if (err) console.log(err);
    else {
        console.log("File written successfully\n");
        console.log("The written file has the following contents:");
        console.log(fs.readFileSync(filePath, "utf8"));
    };
});*/

app.post("/saveData", (req, res) => {
  const jsonData = req.body; // Access JSON data from request body
  console.log(jsonData);
  const filePath = path.join(__dirname, "recentData.json");

  console.log(filePath);
  fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      console.error("Error writing to file:", err);
      return res.status(500).json({ error: "Failed to save data." });
    }
    console.log("Data saved successfully.");
    res.json({ message: "Data saved successfully." });
  });
});
// New route to serve recentData.json
app.get('/api/recentData', (req, res) => {
  const filePath = path.join(__dirname, 'recentData.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Failed to read data.' });
    }

    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return res.status(500).json({ error: 'Invalid JSON data.' });
    }
  });
});

// WebSocket server
wss.on("connection", (ws) => {
  console.log("Client connected");
  
  // Send recentData.json to the newly connected client
  const filePath = path.join(__dirname, "recentData.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading recentData.json:", err);
    } else {
      try {
        const jsonData = JSON.parse(data);
        ws.send(JSON.stringify({
          type: "initialData",
          payload: jsonData
        }));
      } catch (parseErr) {
        console.error("Error parsing recentData.json:", parseErr);
      }
    }
  });

  ws.on("message", (message) => {
    try {
    const data = JSON.parse(message); // Parse the message

    if (data.type === 'ping') { // Check the `type` field in the parsed data
      console.log("Received ping from client");
      // Respond with a pong message
      ws.send(JSON.stringify({ type: 'pong' }));
    }
  } catch (error) {
    console.error("Error parsing message:", error);
  }
    
    console.log("Received message:", message);

    // Broadcast received message to all clients
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
