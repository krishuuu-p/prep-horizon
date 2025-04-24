import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import Panel from "./StudentPanel";

const socket = io("http://10.81.65.73:5000", { transports: ["websocket"] });
function InterviewPage() {
  const [activePage, setActivePage] = useState("Interview Practice");
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);

  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch((err) => console.error("Error accessing media devices.", err));

    socket.on("user-joined", (id) => {
      console.log("User joined event received, id:", id);
      if (stream) {
        callUser(id);
      } else {
        console.warn("Stream not ready when trying to call");
      }
    });

    socket.on("user-signal", (data) => {
      console.log("Receiving call from:", data.callerID);
      setReceivingCall(true);
      setCaller(data.callerID);
      setCallerSignal(data.signal);
    });

    socket.on("receiving-returned-signal", (data) => {
      console.log("Caller received returned signal");
      if (connectionRef.current) {
        try {
          connectionRef.current.signal(data.signal);
        } catch (err) {
          console.error("Error applying returned signal:", err);
        }
      }
    });

    return () => {
      socket.off("user-joined");
      socket.off("user-signal");
      socket.off("receiving-returned-signal");
    };
  }, [stream]);

  const joinRoom = () => {
    console.log("Joining room interviewRoom1");
    socket.emit("join-room", "interviewRoom1");
  };

  const callUser = (userID) => {
    console.log("Initiating call to user:", userID);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    peer.on("signal", (signalData) => {
      console.log("Caller sending signal to callee");
      socket.emit("sending-signal", {
        userToSignal: userID,
        callerID: socket.id,
        signal: signalData
      });
    });

    peer.on("stream", (remoteStream) => {
      console.log("Caller received remote stream");
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.on("error", (err) => console.error("Caller peer error:", err));

    connectionRef.current = peer;
  };

  const acceptCall = () => {
    console.log("Accepting call from:", caller);
    setCallAccepted(true);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    peer.on("signal", (signalData) => {
      console.log("Callee returning signal to caller");
      socket.emit("returning-signal", { signal: signalData, callerID: caller });
    });

    peer.on("stream", (remoteStream) => {
      console.log("Callee received remote stream");
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.on("error", (err) => console.error("Callee peer error:", err));

    if (callerSignal) {
      try {
        peer.signal(callerSignal);
      } catch (err) {
        console.error("Error during callee signaling:", err);
      }
    } else {
      console.warn("No caller signal available to accept call");
    }

    connectionRef.current = peer;
  };

  return (
    <div>
      <Panel activePage={activePage} setActivePage={setActivePage} />
      <h1>Interview Page</h1>
      <button onClick={joinRoom}>Join Room</button>
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div>
          <h3>Your Video</h3>
          <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />
        </div>
        <div>
          <h3>Remote Video</h3>
          <video playsInline ref={userVideo} autoPlay style={{ width: "300px" }} />
        </div>
      </div>
      {receivingCall && !callAccepted && (
        <div style={{ marginTop: "20px" }}>
          <h2>Someone is calling you...</h2>
          <button onClick={acceptCall}>Accept</button>
        </div>
      )}
    </div>
  );
}

export default InterviewPage;
