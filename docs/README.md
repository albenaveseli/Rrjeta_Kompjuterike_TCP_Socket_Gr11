About the Project

This repository demonstrates a complete TCP communication workflow:

✅ Server listens on a TCP port
✅ Multiple clients can connect
✅ Clients send commands/messages
✅ Server processes, responds, and logs activity
✅ Built using Node.js' built-in net module
✅ Clean folder structure (client / server separation)

It’s a hands-on implementation of networking concepts including:

TCP socket creation

Request–response handling

Message parsing

Connection lifecycle management

Error handling

Modular architecture

🧩 Features
✅ Server

Accepts multiple client connections

Logs connection details (IP, port, status)

Handles messages & commands

Gracefully handles disconnects & errors

✅ Client

Connects via TCP to the server

Sends messages from terminal

Receives server responses immediately

Simple interactive interface

✅ Code Architecture

/server contains all server logic

/client contains client functionality

Modular utilities for readability

Extendable protocol design

🛠️ Technologies Used
Tech	Purpose
Node.js	Runtime environment
net module	TCP socket programming
npm scripts	Running server/client
JavaScript (ES6)	Application logic
📂 Project Structure
Rrjeta_Kompjuterike_TCP_Socket_Gr11/
│
├── client/                   # Client-side TCP logic  
│   ├── client.js             # Main client entry  
│   └── modules/              # Helpers (if included)
│
├── server/                   # Server-side TCP logic  
│   ├── server.js             # Main server entry  
│   └── modules/              # Handlers, utilities
│
├── docs/                     # Documentation & diagrams (optional)
│
├── package.json
├── README.md                 # This file
└── .gitignore

🚀 Getting Started
✅ Prerequisites

Before running the project, make sure you have:

Node.js (v14 or newer)

A terminal/console

Git (optional)

✅ Installation

Clone the repository:

git clone https://github.com/albenaveseli/Rrjeta_Kompjuterike_TCP_Socket_Gr11
cd Rrjeta_Kompjuterike_TCP_Socket_Gr11

▶️ Running the Server
cd server
node server.js


📌 The server will start listening on the configured port
(usually something like 8080 or 5000 — check your code).

▶️ Running the Client

Open a second terminal window:

cd client
node client.js


Once connected, you can:

Type messages

Trigger commands

Observe server responses

💬 Example Interaction
Client: Hello Server!
Server: Echo: Hello Server!

Client: /info
Server: Connected as 192.168.0.12:53422


(Add more examples based on your implemented protocol.)

🧪 Recommended Extensions

If you want to expand this project, here are ideas:

Add authentication

Add custom TCP protocol commands

Implement file transfers

Add admin mode

Log activity to database or files

Build a GUI client

🙋‍♂️ Authors – Group 11

Albena Veseli

Bardhi Tahiri

Drin Kurti

Mehmet Mehmeti


📜 License

This project is released under the MIT License.
Feel free to learn from it, modify it, and improve it.

⭐ Show Support

If this project helped you or your group:

➡️ Give the repo a ⭐ on GitHub
➡️ Share your project with classmates
