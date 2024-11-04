import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Button, IconButton, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { AuthContext } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { addToUserHistory } = useContext(AuthContext);
  const socket = useSocket();

  const handleJoinVideoCall = async () => {
    if (!meetingCode) {
      alert("Please enter a meeting code.");
      return;
    }

    // Prompt for the meeting password
    const password = prompt("Please enter the meeting password:");
    if (!password) return; // Exit if no password is provided

    // Log meeting code and password for debugging
    console.log("Meeting Code:", meetingCode);
    console.log("Password:", password);

    try {
      // Send meeting code and password for validation
      const response = await fetch("/api/join_meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meeting_code: meetingCode, password }),
      });

      // Log the response status
      console.log("Response status:", response.status);

      if (response.ok) {
        alert("Joined meeting successfully!");
        navigate(`/${meetingCode}`);
      } else if (response.status === 401) {
        alert("Incorrect password.");
      } else if (response.status === 404) {
        alert("Meeting not found.");
      } else {
        alert("An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error joining meeting:", error);
      alert("Unable to join the meeting at this time.");
    }
  };

  const handleCreateMeeting = async () => {
    const password = prompt("Please set a password for the meeting:");
    if (!password) return;

    console.log("Creating meeting with code:", meetingCode);
    console.log("Meeting password:", password);

    try {
      const response = await fetch("/api/add_to_activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ meeting_code: meetingCode, password }),
      });

      console.log("Create Meeting Response status:", response.status);

      if (response.ok) {
        // After creating the meeting, store it in user history
        await addToUserHistory(meetingCode);  // Call the function here
        alert("Meeting created successfully!");
        navigate(`/${meetingCode}`);
      } else {
        alert("Error creating meeting.");
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      alert("Unable to create the meeting at this time.");
    }
  };

  return (
    <>
      <div className="navBar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2>LinkUp</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={() => navigate("/history")}>
            <RestoreIcon />
          </IconButton>
          <p>History</p>
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h2>Providing Quality Video Call Just Like Quality Education</h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                label="Meeting Code"
                variant="outlined"
              />
              <Button onClick={handleJoinVideoCall} variant="contained">
                Join
              </Button>
              <Button onClick={handleCreateMeeting} variant="contained">
                Create Meeting
              </Button>
            </div>
          </div>
        </div>
        <div className="rightPanel">
          <img srcSet="/logo3.png" alt="" />
        </div>
      </div>
    </>
  );
}

export default withAuth(HomeComponent);
