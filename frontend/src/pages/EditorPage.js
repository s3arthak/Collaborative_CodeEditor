
import React, { useState, useRef, useEffect } from "react";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import ProblemSearch from "../pages/ProblemSearch";

import { initSocket } from "../socket";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState("input");
  const [showProblemSearch, setShowProblemSearch] = useState(false);


  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
  
      
      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);
  
      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }
  
      // Join the room
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });
  
      // When someone joins the room
      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room.`);
          console.log(`${username} joined`);
        }
        setClients(clients);
        
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId,
        });
      });
  
      // When someone disconnects
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => prev.filter((client) => client.socketId !== socketId));
      });
  
      // Receiving chat messages
      socketRef.current.on(ACTIONS.SEND_MESSAGE, ({ message }) => {
        const chatWindow = document.getElementById("chatWindow");
        if (chatWindow) {
          chatWindow.value += message;
          chatWindow.scrollTop = chatWindow.scrollHeight;
        }
      });
  
      // Updating input tab
      socketRef.current.on(ACTIONS.UPDATE_INPUT, ({ input }) => {
        const inputArea = document.getElementById("input");
        if (inputArea && activeTab === "input") {
          inputArea.value = input;
        }
      });
  
      // Updating output tab
      socketRef.current.on(ACTIONS.UPDATE_OUTPUT, ({ output }) => {
        const inputArea = document.getElementById("input");
        if (inputArea && activeTab === "output") {
          inputArea.value = output;
        }
      });
    };
  
    init();
  
    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect_error");
        socketRef.current.off("connect_failed");
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.off(ACTIONS.SEND_MESSAGE);
        socketRef.current.off(ACTIONS.UPDATE_INPUT);
        socketRef.current.off(ACTIONS.UPDATE_OUTPUT);
        socketRef.current.disconnect();
      }
    };
  }, [roomId, location.state?.username, activeTab]);
  

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID has been copied to your clipboard");
    } catch (err) {
      toast.error("Could not copy the room id");
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const inputClicked = () => {
    setActiveTab("input");
    const inputArea = document.getElementById("input");
    inputArea.placeholder = "Enter your input here";
    inputArea.disabled = false;
   // inputArea.value = "";
   socketRef.current.emit(ACTIONS.REQUEST_INPUT, { roomId });  // NEW: ask server for latest input

    const inputLabel = document.getElementById("inputLabel");
    const outputLabel = document.getElementById("outputLabel");
    inputLabel.classList.add("clickedLabel");
    inputLabel.classList.remove("notClickedLabel");
    outputLabel.classList.add("notClickedLabel");
    outputLabel.classList.remove("clickedLabel");
  };

  const outputClicked = () => {
    setActiveTab("output");
    const inputArea = document.getElementById("input");
    inputArea.placeholder = "Your output will appear here after running code.";
    inputArea.disabled = true;
    inputArea.value = "";

    const inputLabel = document.getElementById("inputLabel");
    const outputLabel = document.getElementById("outputLabel");
    inputLabel.classList.remove("clickedLabel");
    inputLabel.classList.add("notClickedLabel");
    outputLabel.classList.remove("notClickedLabel");
    outputLabel.classList.add("clickedLabel");
  };

  const runCode = () => {
    const lang = document.getElementById("languageOptions").value;
    const input = document.getElementById("input").value;
    const code = codeRef.current;

    toast.loading("Running Code...");

    const encodedParams = new URLSearchParams();
    encodedParams.append("LanguageChoice", lang);
    encodedParams.append("Program", code);
    encodedParams.append("Input", input);

    const options = {
      method: "POST",
      url: "https://code-compiler.p.rapidapi.com/v2",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "X-RapidAPI-Key": process.env.REACT_APP_API_KEY,
        "X-RapidAPI-Host": "code-compiler.p.rapidapi.com",
      },
      data: encodedParams,
    };

    axios
      .request(options)
      .then(function (response) {
        let message = response.data.Result;
        if (message === null) {
          message = response.data.Errors;
        }
        outputClicked();
        document.getElementById("input").value = message;
        socketRef.current.emit(ACTIONS.UPDATE_OUTPUT, { roomId, output: message });
        toast.dismiss();
        toast.success("Code compilation complete");
      })
      .catch(function (error) {
        toast.dismiss();
        toast.error("Code compilation unsuccessful");
        document.getElementById("input").value =
          "Something went wrong. Please check your code and input.";
      });
  };

  const sendMessage = () => {
    const inputBox = document.getElementById("inputBox");
    if (inputBox.value.trim() === "") return;
    const message = `> ${location.state.username}:\n${inputBox.value}\n`;
    const chatWindow = document.getElementById("chatWindow");
    chatWindow.value += message;
    chatWindow.scrollTop = chatWindow.scrollHeight;
    inputBox.value = "";
    socketRef.current.emit(ACTIONS.SEND_MESSAGE, { roomId, message });
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    if (activeTab === "input") {
      socketRef.current.emit(ACTIONS.UPDATE_INPUT, { roomId, input });
    }
  };

  return (
    <div className="mainWrap">
      <div className="asideWrap">
        <div className="asideInner">
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <label>
          Select Language:
          <select id="languageOptions" className="seLang" defaultValue="17">
            <option value="4">Java</option>
            <option value="5">Python</option>
            <option value="6">C (gcc)</option>
            <option value="7">C++ (gcc)</option>
          </select>
        </label>
        <button className="btn runBtn" onClick={runCode}>
          Run Code
        </button>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>

      <div className="editorWrap">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
        <div className="IO-container">
          <label id="inputLabel" className="clickedLabel" onClick={inputClicked}>
            Input
          </label>
          <label id="outputLabel" className="notClickedLabel" onClick={outputClicked}>
            Output
          </label>
        </div>
        <textarea
          id="input"
          className="inputArea textarea-style"
          placeholder="Enter your input here"
          onChange={handleInputChange}
        ></textarea>
      </div>
       <div className="chatWrap">
  <div className="tabButtons">
    <label
      id="inputLabel"
      className={activeTab === "input" ? "clickedLabel" : "notClickedLabel"}
      onClick={inputClicked}
    >
      Chat
    </label>
    <label
      id="outputLabel"
      className={activeTab === "output" ? "clickedLabel" : "notClickedLabel"}
      onClick={outputClicked}
    >
      Search Problem
    </label>
  </div>

  <div className="tabContent">
    {activeTab === "input" ? (
      <>
        <textarea
          id="chatWindow"
          className="chatArea textarea-style"
          placeholder="Chat messages will appear here"
          disabled
        ></textarea>
        <div className="sendChatWrap">
          <input
            id="inputBox"
            type="text"
            placeholder="Type your Message here"
            className="inputField"
            onKeyUp={handleInputEnter}
          />
          <button className="btn sendBtn" onClick={sendMessage}>
            Send
          </button>
        </div>
      </>
    ) : (
      <ProblemSearch />
    )}
  </div>
</div>
      </div>
      
  );
};

export default EditorPage;
