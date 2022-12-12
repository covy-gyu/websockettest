import WebSocket, { WebSocketServer } from "ws";
import { randomUUID } from "crypto";
import express from "express";

const app = express();

app.use(express.static("public"));

app.listen(8000, () => {
  console.log(`Example app listening on port 8000`);
});

const clients = new Map(); // has to be a Map instead of {} due to non-string keys

const wss = new WebSocketServer({ port: 8080 }); // initiate a new server that listens on port 8080
let arr = [];

// set up event handlers and do other things upon a client connecting to the server
wss.on("connection", (ws) => {
  // create an id to track the client
  const rid = randomUUID();
  let id = rid.substring(0, 3);

  clients.set(ws, id);
  console.log(`new connection assigned id: ${id}`);
  
  // send the id back to the newly connected client
  // connected users info - broadcast
  arr = updateArrID(clients);
  serverBroadcast(JSON.stringify(arr))

  // onmessage, request connected users info for table load
  ws.on("message", (data) => {
    if (data == "tableLoad") {
        arr = updateArrID(clients);
        ws.send(JSON.stringify(arr));
    }
    console.log(`received: ${data}`);

  });

  // stop tracking the client upon that client closing the connection
  ws.on("close", () => {
    console.log(`connection (id = ${clients.get(ws)}) closed`);
    clients.delete(ws);
    arr = updateArrID(clients);
    serverBroadcast(JSON.stringify(arr))
  });
});

// send a message to all the connected clients about how many of them there are every 15 seconds
// setInterval(() => {
//     console.log(`Number of connected clients: ${clients.size}`);
//     serverBroadcast(`Number of connected clients: ${clients.size}`);
// }, 15000);

// function for sending a message to every connected client
function serverBroadcast(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
function updateArrID(clients) {
  var arrID = [];
  for (const [key, value] of clients) {
    arrID.push(value);
  }
  return arrID;
}

console.log("The server is running and waiting for connections");
