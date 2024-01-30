import express from "express";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import router from "./Route/auth";
import cors from "cors";
import dbConnection from "./db";

require("dotenv").config();

const app: express.Express = express();
const server: http.Server = http.createServer(app);
const io: SocketIOServer = new SocketIOServer(server);

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

//database connection
dbConnection();

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Chat App Server is working fine");
});
app.use("/user/auth", router);

io.on("connection", (socket: Socket) => {
  // socket.on("chat",(msg)=>{
  //     io.emit("chat", msg)
  // })
  console.log("socket io connected");
});

const PORT: number = parseInt(process.env.PORT || "8000", 10);

server.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});
