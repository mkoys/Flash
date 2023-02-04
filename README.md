# Flash
A simple WebSocket server written in JavaScript. It uses the http and crypto modules and has support for handling incoming and outgoing WebSocket frames.

## Installation
To install Flash, you'll need to have Node.js installed on your system. Run the following command to install it:
```bash
npm install flash
```

## Usage
```js
// Import flash
import flash from "flash";

// Create application instance
const server = flash();

// Initialize instance
server.init();

// On new socket handshake
server.event("handshake", (request, socket) => {
  // Your handshake logic
  socket.accept();
});

// After handshake succesfull
server.event("connection", (request, socket) => {
  // On event of message log content
  socket.event("message", (content) => {
    console.log("Received message:", content);
  });
});

// Application listen on port
server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
```

## API

### Application
Creates new instance of websocket server.
```js
const app = flash({ server });
```
- **server**: HTTP server instance

### Application Initialize
Initializes websocket server events
```js
app.init();
```

### Application Listen
Application instance listen on port
```js
app.listen(port, callback);
```
- **port**: Port for server to listen on
- **callback**: Executes after server is listening

### Application Events
Attaches an event handler for the given type. The following types are supported:
- **handshake**: Established while new socket is trying to connect
- **connection**: After connection with socket is established
- **end**: Socket disocnnecting
```js
app.event(type, callback);
const callback = (request, socket) => {...}
```
- **type**: Type of event (String)
- **callback**: Callback function for event passes
- **callback (request)**: Request object connection
- **callback (socket)**: Socket object connection

### Socket Accept/Decline
Accepts/Declines the client's connection request. This must be called in the handshake event if you want to accept the client's connection.
```js
// On new socket handshake
server.event("handshake", (request, socket) => {
  // Accept connection
  socket.accept();
  // Accept connection
  socket.decline();
});
```

### Socket event
Attaches an event handler for the given type
```js
// On established connection
server.event("connection", (request, socket) => {
    // Await message event and print incoming content
    socket.event("message", (content) => {
        console.log(content);
    });
});
```
- **type**: Type of event (String)
- **callback**: Callback function for event with content as parameter

### Socket Send
Sends a message to the client. The message parameter can be any type that can be serialized to JSON.
```js
// On established connection
server.event("connection", (request, socket) => {
    // Send message to socket
    socket.send({message: "Welcome"});
});
```
- **content**: Content of message

## Contributing
Bug reports and pull requests are welcome. Please open an issue if you encounter any problems.
