/**
 * @typedef {{
 *   username: string
 *   password: string // - hashed + salted
 * }} User
 *
 * @typedef {{
 *  __count__: (size: number) => void
 *  __disconnect__: (args: {id: string}) => void
 *  __connect__: () => void
 * }} ServerToClientEvents
 *
 * @typedef {{
 *   type?: "controller" | "view"
 * }} SocketData
 */

import cors from "cors";
import mime from "mime";
import dotenv from "dotenv";
import * as path from "path";
import express from "express";
import {readFileSync} from "fs";
import {Server} from "socket.io";
import {fileURLToPath} from "url";
import {instrument} from "@socket.io/admin-ui";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {(sockets: Map<string, import("socket.io").Socket<any, any, any, SocketData>>) => number} */
const getViewCount = sockets => {
  let count = 0;

  for (let [_k, v] of sockets) {
    if (v.data.type !== "view") continue
    count += 1;
  }

  return count;
};

dotenv.config();
const config = JSON.parse(readFileSync("config.json").toString());
/** @type {User[]} */
const credentials = JSON.parse(readFileSync("credentials.json").toString());

/** @type {(namespace: import("socket.io").Namespace<{}, ServerToClientEvents, {}, SocketData>, authenticate: boolean) => void} */
const configureNamespace = (namespace, authenticate = true) => {
  namespace.use((socket, next) => {
    if (!authenticate) {
      next();
      return;
    }

    const {username, password} = socket.handshake.auth;
    const user = credentials.find(user => user.username === username);

    if (user === undefined || user.password !== password) {
      next(new Error("UNAUTHORIZED"));
    } else {
      next();
    }
  });

  namespace.on("connection", client => {
    console.log(`Client ${client.id} with type ${client.data.type ?? "default"} connected via namespace ${client.nsp.name} from ${client.handshake.address}`);

    if (client.data.type === "view") {
      namespace.emit(/** @type {"__connect__"} */ "__connect__");
    }

    client.onAny((eventName, ...args) => {
      if (eventName === "__count__" && client.data.type === "controller") {
        client.emit(/** @type {"__count__"} */ "__count__", getViewCount(namespace.sockets));
      }
      namespace.emit(eventName, ...args);
    });

    client.on("disconnect", () => {
      if (client.data.type === "controller") return;
      namespace.emit(/** @type {"__disconnect__"} */"__disconnect__", {id: client.id});
    });
  });
};

const app = express();

app.use(cors(config["cors"] ?? {origin: "*"}));
app.use(express.static("public"));
app.use("/admin", express.static(path.join("node_modules", "@socket.io", "admin-ui", "ui", "dist")));

app.get("/socket.io.js", (_req, res) => {
  res.setHeader("Content-Type", mime.lookup('.js'));
  if (process.env.NODE_ENVIRONMENT === "production") {
    res.sendFile(path.join(__dirname, "..", "node_modules", "socket.io-client", "dist", "socket.io.js"));
  } else {
    res.sendFile(path.join(__dirname, "socket.io.js"));
  }
});

const server = app.listen(parseInt(process.env.PORT ?? "8080"), process.env.HOST ?? "127.0.0.1", () => console.log(`Listening on ${process.env.HOST}:${process.env.PORT}`));
const io = new Server(server, /** @type {import("socket.io").Partial<import("socket.io").ServerOptions>} */ config);

io.of("/").use((_socket, next) => {
  next(new Error("UNAUTHORIZED"));
});

const auth = !process.env.USERNAME || !process.env.PASSWORD ? false : {
  type: /** @type {"basic"} */ "basic",
  username: process.env.USERNAME,
  password: process.env.PASSWORD
};
instrument(io, {auth, mode: process.env.NODE_ENV === "production" ? "production" : "development"});

const defaultNamespace = io.of("/sharedsocket");
const dynamicNamespace = io.of(/^\/do-.+$/);

configureNamespace(defaultNamespace, false);
configureNamespace(dynamicNamespace);
