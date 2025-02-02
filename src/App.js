import React, { useState } from "react";
import "./App.css";

function App() {
    const [userInput, setUserInput] = useState("");
    const [messages, setMessages] = useState([]);
    
    // Rasa server URL
    const rasaServerUrl = "http://3.86.45.30:5005/webhooks/rest/webhook";

    // Function to send message to Rasa server
    const sendMessage = async () => {
        if (!userInput.trim()) return;
    
        // Add the user's message to the chat
        const userMessage = { text: userInput, sender: "user" };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setUserInput(""); // Clear the input box
    
        try {
            console.log("Sending message to Rasa:", userInput);
    
            // Send the message in the correct format
            const jsonMessage = JSON.stringify({
                sender: "user", // Ensure sender is specified
                message: userInput,
            });
    
            const response = await fetch(rasaServerUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", // Ensure the Content-Type is application/json
                },
                body: jsonMessage, // Send as JSON
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log("Rasa response:", data);
    
            // If response contains messages, display them in the chat
            if (data && data.length > 0) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    ...data.map((msg) => ({
                        text: msg.text || "No response from Rasa",
                        sender: "bot",
                    })),
                ]);
            } else {
                console.warn("No response from Rasa");
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: "No response from Rasa server.", sender: "error" },
                ]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: "Error sending message to Rasa server.", sender: "error" },
            ]);
        }
    };
    

    // Handle keypress event to trigger message send on Enter
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="container">
            <div className="chat-header">hello from healthbot!</div>
            <div className="response-section">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="query-section">
                <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="type your message here!!"
                ></textarea>
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default App;
