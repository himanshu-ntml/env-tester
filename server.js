const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
const app = express();
const port = 3000;

// 🔐 Static token (32-character random string)
const AUTH_TOKEN = "uYpXW9r3vQtszKjMhLDcRAeF1NbVGoix"; // replace with your own

let isRunning = false;

function requireAuth(req, res, next) {
  const token =
    req.headers["authorization"]?.replace("Bearer ", "") || req.query.token;

  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
}

app.get("/health", (_, res) => res.status(200).send("OK"));

app.get("/status", (_, res) => {
  try {
    const data = fs.readFileSync("/app/status.json", "utf-8");
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(500).json({ error: "Could not read status.json" });
  }
});

app.post("/dump", requireAuth, (_, res) => {
  if (isRunning) {
    return res.status(409).json({ message: "Sync already in progress" });
  }

  isRunning = true;

  exec("sh /app/sync.sh dump", (error, stdout, stderr) => {
    isRunning = false;

    if (error) {
      fs.writeFileSync(
        "/app/status.json",
        JSON.stringify({
          state: `❌ Dump failed: ${error.message}`,
          updatedAt: new Date().toISOString(),
        })
      );
      console.error(`exec error: ${error.message}`);
      return;
    }

    console.log(`stdout: ${stdout}`);
    if (stderr) console.error(`stderr: ${stderr}`);
  });

  res.status(202).json({ message: "Production dump started" });
});

app.post("/restore", requireAuth, (req, res) => {
  const target = req.query.target;

  if (!target || !["dev", "staging"].includes(target)) {
    return res
      .status(400)
      .json({ message: "Missing or invalid ?target=dev|staging" });
  }

  if (isRunning) {
    return res
      .status(409)
      .json({ message: "Another operation is already in progress" });
  }

  isRunning = true;

  exec(`sh /app/sync.sh ${target}`, (error, stdout, stderr) => {
    isRunning = false;

    if (error) {
      fs.writeFileSync(
        "/app/status.json",
        JSON.stringify({
          state: `❌ Restore to ${target} failed: ${error.message}`,
          updatedAt: new Date().toISOString(),
        })
      );
      console.error(`exec error: ${error.message}`);
      return;
    }

    console.log(`stdout: ${stdout}`);
    if (stderr) console.error(`stderr: ${stderr}`);
  });

  res.status(202).json({ message: `Restore to ${target} started` });
});

app.get("/download", requireAuth, (req, res) => {
  const filePath = "/tmp/prod.sql"; // adjust path if needed

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: "Dump file not found" });
    }

    res.download(filePath, "latest-dump.tar.gz", (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).send("Failed to download file");
      }
    });
  });
});

app.listen(port, () => {
  console.log(`📡 Sync API running on http://localhost:${port}`);
});
