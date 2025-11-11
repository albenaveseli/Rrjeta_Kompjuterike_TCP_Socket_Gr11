# 🌐 Rrjeta Kompjuterike TCP Socket - Grupi 11

## A Node.js TCP Client–Server Application

This project implements a complete **TCP communication system** using **Node.js** core `net` sockets. It features a robust server capable of handling multiple connections, differentiating between standard and administrative clients, executing commands, monitoring traffic, and managing file transfers.

Developed as coursework for a **Computer Networks** (*Rrjeta Kompjuterike*) subject, this application demonstrates practical client–server interactions at the TCP socket level.

---

## ✨ Features

The application is split into three main components, each with distinct capabilities:

### ✅ Server

* **Connection Handling:** Listens for and manages multiple incoming TCP connections.
* **User Differentiation:** Differentiates **Admin** users based on whitelisted IP addresses (configurable in `server/config.json`).
* **Activity Logging:** Logs all connection, disconnection, and command execution activities.
* **Data Services:** Supports receiving various commands and data payloads.
* **File Transfer:** Implements reliable file upload functionality.
* **Traffic Monitoring:** Tracks and reports incoming and outgoing data traffic per client.
* **Control:** Handles client timeouts and supports forced disconnects.

### 💻 Admin Client

* **Elevated Access:** Automatically granted admin privileges upon connection if the IP is whitelisted.
* **File Upload/Download   - Read/Message:** Using commands: /uploadfile <path> <filename>    /download <filename> etc...

### 👤 Standard Client

* **Basic Communication:** Sends regular messages to the server.
* **Limited Permissions:** Operates with read-only or limited execution privileges.
* **Real-time Response:** Receives real-time responses and broadcasted server messages.

## 🧩 Project Structure
Rrjeta_Kompjuterike_TCP_Socket_Gr11/
│
├── server/
│ ├── index.js
│ ├── handlers/
│ ├── utils/
│ ├── services/
│ └── config.json
│
├── client/
│ ├── src/
│ │ ├── Client.js
│ │ ├── AdminClient.js
│ │ └── UserClient.js
│ └── index.js
│
├── package.json
└── README.md


---

## 🛠️ Installation

### Prerequisites

* **Node.js** (v16 or higher recommended)

### Setup Steps

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/albenaveseli/Rrjeta_Kompjuterike_TCP_Socket_Gr11.git](https://github.com/albenaveseli/Rrjeta_Kompjuterike_TCP_Socket_Gr11.git)
    cd Rrjeta_Kompjuterike_TCP_Socket_Gr11
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

---

## ▶️ Usage

### 1. Running the Server and Client

Start the server from the root directory:

```bash
cd server
npm start server
```

Start the client from the root directory:

```bash
//Client side
cd client
npm run client


//Client as admin
cd client
npm run admin
```
After running these commands, CLI will show options that us as users can run.








