import cors from "cors";
import mime from "mime";
import dotenv from "dotenv";
import * as path from "path";
import express from "express";
import {readFileSync} from "fs";
import {fileURLToPath} from 'url';
import {instrument} from "@socket.io/admin-ui";
import {Namespace, Server, ServerOptions} from "socket.io";

type User = {
  username: string
  password: string // hashed + salted
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const config = JSON.parse(readFileSync("config.json").toString());
const credentials: User[] = JSON.parse(readFileSync("credentials.json").toString());

const configureNamespace = (namespace: Namespace, authenticate: boolean = true) => {
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
    const clientIP = client.handshake.address;
    console.log(`Client ${clientIP} connected via namespace ${namespace.name}`);

    client.onAny((eventName, ...args) => {
      namespace.emit(eventName, ...args);
    });

    client.on("disconnect", () => {
      namespace.emit("socket-disconnect", {id: client.id});
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

const server = app.listen(parseInt(process.env.PORT ?? "8080"), process.env.HOST ?? "127.0.0.1", () => console.log("Server initialised!"));
const io = new Server(server, config as Partial<ServerOptions>);

io.of("/").use((_socket, next) => {
  next(new Error("UNAUTHORIZED"));
});

const auth = !process.env.USERNAME || !process.env.PASSWORD ? false : {
  type: "basic" as const,
  username: process.env.USERNAME,
  password: process.env.PASSWORD
};
instrument(io, {auth, mode: process.env.NODE_ENV === "production" ? "production" : "development"});

const defaultNamespace = io.of("/sharedsocket");
const dynamicNamespace = io.of(/^\/do-.+$/);

configureNamespace(defaultNamespace, false);
configureNamespace(dynamicNamespace);
