// src/pages/InterviewPage.js
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import Panel from "./StudentPanel";
import "../styles/InterviewPage.css";

// Server URLs
const SOCKET_SERVER_URL = "http://localhost:5000";  // REPLACE THIS WITH YOUR URLS
const EMOTION_SERVER_URL = "http://localhost:5001"; // REPLACE THIS WITH YOUR URLS
const socket = io(SOCKET_SERVER_URL, { transports: ["websocket"] });
function InterviewPage() {
  const [activePage, setActivePage] = useState("Interview Practice");
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [emotion, setEmotion] = useState("");

  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;
      })
      .catch((err) => console.error("Error accessing media devices.", err));

    socket.on("user-joined", (id) => {
      if (stream) callUser(id);
    });

    socket.on("user-signal", (data) => {
      setReceivingCall(true);
      setCaller(data.callerID);
      setCallerSignal(data.signal);
    });

    socket.on("receiving-returned-signal", (data) => {
      if (connectionRef.current) connectionRef.current.signal(data.signal);
    });

    return () => {
      socket.off("user-joined");
      socket.off("user-signal");
      socket.off("receiving-returned-signal");
    };
  }, [stream]);

  // Capture a frame every second for emotion analysis
  useEffect(() => {
    if (!stream) return;
    const interval = setInterval(() => {
      const video = myVideo.current;
      if (!video) return;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const formData = new FormData();
        formData.append("image", blob, "frame.png");

        fetch(`${EMOTION_SERVER_URL}/emotion`, {
          method: "POST",
          body: formData
        })
          .then((res) => res.json())
          .then((data) => setEmotion(data.emotion))
          .catch((err) => console.error("Error sending emotion request:", err));
      }, "image/png");
    }, 10);

    return () => clearInterval(interval);
  }, [stream]);

  const joinRoom = () => {
    socket.emit("join-room", "interviewRoom1");
  };

  const callUser = (userID) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (signalData) => {
      socket.emit("sending-signal", {
        userToSignal: userID,
        callerID: socket.id,
        signal: signalData
      });
    });

    peer.on("stream", (remoteStream) => {
      if (userVideo.current) userVideo.current.srcObject = remoteStream;
    });

    connectionRef.current = peer;
  };

  const acceptCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (signalData) => {
      socket.emit("returning-signal", {
        signal: signalData,
        callerID: caller
      });
    });

    peer.on("stream", (remoteStream) => {
      if (userVideo.current) userVideo.current.srcObject = remoteStream;
    });

    if (callerSignal) peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  return (
    <div className="interview-page">
      <Panel activePage={activePage} setActivePage={setActivePage} />
      <h1>Interview Page</h1>
      <button onClick={joinRoom}>Join Room</button>

      <div className="video-container">
        <div className="video-box">
          <h3>Your Video</h3>
          <video playsInline muted ref={myVideo} autoPlay />
          <div className="emotion-label">
            <strong>Emotion:</strong> {emotion}
          </div>
        </div>
        <div className="video-box">
          <h3>Remote Video</h3>
          <video playsInline ref={userVideo} autoPlay />
        </div>
      </div>

      {receivingCall && !callAccepted && (
        <div className="incoming-call">
          <h2>Someone is calling you...</h2>
          <button onClick={acceptCall}>Accept</button>
        </div>
      )}
    </div>
  );
}

export default InterviewPage;
