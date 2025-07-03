const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
const app = express();
const port = 3000;

let isRunning = false;

app.get("/health", (_, res) => res.status(200).send("OK"));

app.get("/status", (_, res) => {
  try {
    const data = fs.readFileSync("/app/status.json", "utf-8");
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(500).json({ error: "Could not read status.json" });
  }
});

app.post("/start-sync", (_, res) => {
  if (isRunning) {
    return res.status(409).json({ message: "Sync already in progress" });
  }

  isRunning = true;

  exec("sh /app/sync.sh", (error, stdout, stderr) => {
    isRunning = false;
    if (error) {
      fs.writeFileSync(
        "/app/status.json",
        JSON.stringify({
          state: `❌ Error: ${error.message}`,
          updatedAt: new Date().toISOString(),
        })
      );
      console.error(`exec error: ${error.message}`);
      return;
    }

    console.log(`stdout: ${stdout}`);
    if (stderr) console.error(`stderr: ${stderr}`);
  });

  res.status(202).json({ message: "Sync started" });
});

app.listen(port, () => {
  console.log(`📡 Sync API running on http://localhost:${port}`);
});
