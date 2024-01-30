"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const auth_1 = __importDefault(require("./Route/auth"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db"));
require("dotenv").config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
//database connection
(0, db_1.default)();
app.get("/", (req, res) => {
    res.send("Chat App Server is working fine");
});
app.use("/user/auth", auth_1.default);
io.on("connection", (socket) => {
    // socket.on("chat",(msg)=>{
    //     io.emit("chat", msg)
    // })
    console.log("socket io connected");
});
const PORT = parseInt(process.env.PORT || "8000", 10);
server.listen(PORT, () => {
    console.log(`App is running at http://localhost:${PORT}`);
});
