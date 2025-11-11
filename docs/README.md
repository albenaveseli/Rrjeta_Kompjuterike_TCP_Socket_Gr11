Rrjeta Kompjuterike TCP Socket — Grupi 11

A Node.js TCP Client–Server Application

This project implements a full TCP communication system using Node.js core net sockets.
It includes an Admin Client, a Standard Client, and a Server capable of handling commands, monitoring traffic, uploading files, and managing connected users.

The project was developed as coursework for Rrjeta Kompjuterike and demonstrates practical client–server interactions at the socket level.

🚀 Features
✅ Server

Listens for incoming TCP connections

Differentiates Admin users by IP

Logs connection activity

Receives commands and data

Supports file transfers

Tracks traffic per client

Handles timeouts and forced disconnects

Modular structure (Handlers, Services, Utils)

✅ Admin Client

Can upload files directly to the server

Has access to admin-level commands

Can inspect traffic logs

Receives server responses in real-time

✅ Standard Client

Read-only or limited permissions

Sends regular messages

Receives broadcasted server responses

🧩 Project Structure
Rrjeta_Kompjuterike_TCP_Socket_Gr11/
│
├── server/
│   ├── index.js              # Entry point for server
│   ├── handlers/             # Socket handlers
│   ├── utils/                # Helper utilities
│   ├── services/             # File manager, traffic monitor, config loader
│   └── config.json           # Settings (ports, admin IPs)
│
├── client/
│   ├── src/
│   │   ├── Client.js         # Base client instance
│   │   ├── AdminClient.js    # Admin client with file upload
│   │   └── UserClient.js     # Standard user client
│   └── index.js              # Entry point for client
│
├── package.json
└── README.md


(Folder names may vary depending on your exact structure, but this format reflects common Node TCP architecture.)

🛠️ Installation

Make sure you have Node.js (v16+) installed.

git clone https://github.com/<your-username>/Rrjeta_Kompjuterike_TCP_Socket_Gr11.git
cd Rrjeta_Kompjuterike_TCP_Socket_Gr11
npm install

▶️ Running the Server
cd server
node index.js


If the server starts successfully, you'll see something like:

Server listening on port 3000...

▶️ Running the Client
Standard Client:
cd client
node index.js

Admin Client:
cd client
node index.js --admin


(Depending on your implementation, the flag may vary. Adjust text as needed.)

📡 General Command Examples

Inside the client terminal:

Command	Description
echo <text>	Sends a message to the server
/uploadfile path/to/file name	Admin command to upload a file
/traffic	Shows traffic details
/exit	Disconnect from the server
📂 File Upload Example

Admin user runs:

/uploadfile C:\Users\User\Desktop\Tasks.txt Tasks.txt


The server will receive the file, process it, and notify the admin.

👥 Admin Privileges

Admins are detected using the IP list inside:

server/config.json


For example:

{
  "admin": {
    "allowedIPs": ["127.0.0.1"]
  }
}


Any client connecting from these IPs becomes an Admin Client.

🧠 Tech Used

Node.js

net TCP sockets

readline interface

File streams

Buffer processing

Custom packet handling

🛤️ Future Improvements

Add encryption (AES or RSA)

Add authentication per user

Implement GUI client

Store logs in a database

Add chat-room channels

👨‍💻 Authors

Grupi 11 – Rrjeta Kompjuterike

If you'd like, I can add a Contributors section with names and roles
