import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { validateBackupRequest } from "./utils/validators.js";
import { spawn } from "child_process";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());

app.post("/backup", validateBackupRequest, (req, res) => {
  const { action, outputFormat, dbType, sourceUrl } = req.body;


  if (dbType === "postgres" && action === "backup") {

    // Set headers so browser downloads file
    res.setHeader("Content-Type", "application/octet-stream");

    const formatFlag = outputFormat === "tar" ? ["-F", "t"] : ["-F", "p"];

    // Spawn pg_dump and pipe stdout to client
    const dump = spawn("pg_dump", [...formatFlag, sourceUrl]);

    dump.stdout.pipe(res); // send backup directly to client

    dump.stderr.on("data", (data) => {
      console.error("pg_dump error:", data.toString());
    });

    dump.on("close", (code) => {
      if (code !== 0) {
        console.error(`pg_dump exited with code ${code}`);
      }
    });
  }  else {
    res.status(400).json({ success: false, message: "Invalid request" });
  }
});

app.post("/migrate", validateBackupRequest, async (req, res) => {
    const { action, dbType, sourceUrl, destUrl } = req.body;
  
    if (dbType === "postgres" && action === "migrate") {

    const dump = spawn("pg_dump", ["-F", "t", sourceUrl]);
    const restore = spawn("pg_restore", ["--clean","--if-exists","--no-owner","--no-privileges", "-d", destUrl]);


    // Pipe dump stdout directly to restore stdin
    dump.stdout.pipe(restore.stdin);

    restore.stdout.on("data", (data) => console.log(data.toString()));
    restore.stderr.on("data", (data) => console.error(data.toString()));
  
      restore.on("close", (code) => {
        if (code === 0) {
          res.json({
            success: true,
            message: "Migration / restore completed successfully!",
          });
        } else {
          res.status(500).json({
            success: false,
            message: "Migration / restore finished with errors",
            details: stderrData,
          });
        }
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid request" });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});
