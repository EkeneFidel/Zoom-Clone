const socket = io();

const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const chatMessages = document.getElementById("chat__window");
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443",
});

let myVideoStream;

navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);

        peer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });

        socket.on("user-connected", (userId) => {
            console.log(userId + "connected");
            connectToNewUser(userId, stream);
        });
    });

peer.on("open", (id) => {
    socket.emit("join-room", roomId, id);
});

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
};

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });
    videoGrid.append(video);
};

let text = $("input");

$("html").keydown((e) => {
    if (e.which == 13 && text.val().length !== 0) {
        socket.emit("message", text.val());
        text.val("");
    }
});

socket.on("createMessage", (message) => {
    $(".messages").append(
        `<li class="message"><b>user</b><br/>${message}</li> `
    );

    chatMessages.scrollTop = chatMessages.scrollHeight;
});

const scrollToBottom = () => {
    let d = $(".main__chat__window");
    d.scrollToTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
};

const setMuteButton = () => {
    const html = `<i class="fa-solid fa-microphone"></i>
    <span>Mute</span>`;

    document.querySelector(".main__mute__button").innerHTML = html;
};

const setUnmuteButton = () => {
    const html = `<i class="unmute fa-solid fa-microphone-slash"></i>
    <span>Unmute</span>`;

    document.querySelector(".main__mute__button").innerHTML = html;
};

const playStop = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
};

let setStopVideo = () => {
    const html = `<i class="fa-solid fa-video"></i><span>Stop Video</span>`;
    document.querySelector(".main__video__button").innerHTML = html;
};

let setPlayVideo = () => {
    const html = `<i class="stop fa-solid fa-video-slash"></i><span>Play Video</span>`;
    document.querySelector(".main__video__button").innerHTML = html;
};
