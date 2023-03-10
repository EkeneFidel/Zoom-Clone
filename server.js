const express = require("express");

const http = require("http");
const { v4: uuidv4 } = require("uuid");
const { Server } = require("socket.io");
const { ExpressPeerServer } = require("peer");

const app = express();
require("dotenv").config();

PORT = process.env.PORT;
const server = http.createServer(app);
const io = new Server(server);
const peerServer = ExpressPeerServer(server, { debug: true });

app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(function (req, res, next) {
    res.setHeader(
        "Content-Security-Policy-Report-Only",
        "default-src 'self'; font-src 'self' https://kit.fontawesome.com/007f88da66.js; img-src 'self'; script-src 'self'; style-src 'self' https://kit.fontawesome.com/007f88da66.js https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css; frame-src 'self';"
    );
    next();
});
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId);

        socket.on("message", (messages) => {
            io.to(roomId).emit("createMessage", messages);
        });
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
