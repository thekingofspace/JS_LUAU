import http from "http";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { pathToFileURL } from "url";

const runLuauScript = () => {
  return new Promise((resolve, reject) => {
    const proc = spawn("lune", ["run", "Index"]);

    proc.stdout.on("data", (data) => {
      process.stdout.write(`${data}`);
    });

    proc.stderr.on("data", (data) => {
      process.stderr.write(`[LUAU] ERROR: ${data}`);
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(`Process exited with code ${code}`);
      }
    });
  });
};

const JSON_FOLDER = "./actions";
const PORT = 8080;

const globalStore = new Map();

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.headers["content-type"] === "application/json") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const parsed = JSON.parse(body);
        const modPath = pathToFileURL(path.resolve(JSON_FOLDER, `${parsed.type}.js`)).href;

        if (fs.existsSync(new URL(modPath))) {
          const mod = await import(modPath);
          if (typeof mod.default === "function") {

            const result = await mod.default(parsed.data, globalStore);

            if (result && result.persist && result.key) {
              globalStore.set(result.key, result.value);
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ response: result?.value ?? result ?? "No result returned from module" }));
          } else {
            res.writeHead(404);
            res.end("Module does not export a default function.");
          }
        } else {
          res.writeHead(404);
          res.end("Module not found.");
        }
      } catch (err) {
        console.error("Error processing request:", err);
        res.writeHead(500);
        res.end("Internal server error.");
      }
    });
  } else {
    res.writeHead(404);
    res.end("Invalid request.");
  }
});

server.listen(PORT, async () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);

  try {
    await runLuauScript();
  } catch (error) {
    console.error(error);
  }
});
