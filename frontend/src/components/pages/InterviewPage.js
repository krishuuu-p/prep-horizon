import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";

// Connect to the backend (make sure your server is running on port 5000)
const socket = io("http://10.81.65.73:5000", { transports: ["websocket"] });
function InterviewPage() {
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);

  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);

  // Set up local video stream and socket events when component mounts.
  useEffect(() => {
    // Get local camera & audio stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch((err) => console.error("Error accessing media devices.", err));

    // When another user joins the room, this user (as caller) initiates a call.
    socket.on("user-joined", (id) => {
      console.log("User joined event received, id:", id);
      // Only attempt to call if we already have our own stream ready.
      if (stream) {
        callUser(id);
      } else {
        console.warn("Stream not ready when trying to call");
      }
    });

    // When receiving a signal, this means someone is calling you.
    socket.on("user-signal", (data) => {
      console.log("Receiving call from:", data.callerID);
      setReceivingCall(true);
      setCaller(data.callerID);
      setCallerSignal(data.signal);
    });

    // When caller receives the returned signal (callees response)
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
    // Create a new Peer as initiator with the local stream.
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    // When the peer generates a signal (SDP offer), send it to the callee.
    peer.on("signal", (signalData) => {
      console.log("Caller sending signal to callee");
      socket.emit("sending-signal", {
        userToSignal: userID,
        callerID: socket.id,
        signal: signalData
      });
    });

    // When the peer receives the callee’s remote stream, display it.
    peer.on("stream", (remoteStream) => {
      console.log("Caller received remote stream");
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    // Log errors for debugging.
    peer.on("error", (err) => console.error("Caller peer error:", err));

    // Save the peer connection for further signaling.
    connectionRef.current = peer;
  };

  const acceptCall = () => {
    console.log("Accepting call from:", caller);
    setCallAccepted(true);

    // Create a new Peer as callee with the local stream.
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    // When the callee peer generates a signal (SDP answer), send it to the caller.
    peer.on("signal", (signalData) => {
      console.log("Callee returning signal to caller");
      socket.emit("returning-signal", { signal: signalData, callerID: caller });
    });

    // When the callee peer receives the caller’s stream, display it.
    peer.on("stream", (remoteStream) => {
      console.log("Callee received remote stream");
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    // Log errors.
    peer.on("error", (err) => console.error("Callee peer error:", err));

    // Apply the caller's signal once.
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
