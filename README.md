# firesocket
A Library that makes using firebase realtime database easier for bidirectional communication.

## How to setup firebase
- Create a firebase realtime database project
- Enable the anonymouse sign in method in authentication
- Set the rules of the realtime database to:
  ```json
  {
    "rules": {
      "users": {
        ".read": "auth != null",
        "$uid": {
          ".write": "auth != null && auth.uid === $uid",
        }
      }
    }
  }
  ```
## Usage
initialization
```js
import FireSocket from "https://nulljcd.github.io/firesocket/firesocket.js";

let fireSocket = new FireSocket(yourFirebaseConfig);
// You are automatically connected on initialization
```
methods
```js
fireSocket.connect().then(() => {
  // You connected successfully
}).catch((error) => {
  
});

fireSocket.disconnect().then(() => {
  // You disconnected successfully
}).catch((error) => {

});

fireSocket.broadcast("data").then(() => {
  // You broadcasted successfully
}).catch((error) => {
  
});
```
listeners
```js
fireSocket.onConnection = (userId) => {
  // A user connected
}

fireSocket.onDisconnection = (userId) => {
  // A user disconnected
}

fireSocket.onBroadcast = (userId, data) => {
  // A user broadcast some data
}
```
variables
```js
fireSocket.userId; // Your unique user id
fireSocket.isConnected; // If you are connected or not
fireSocket.connectedUsers; // All connected users
```
