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

fireSocket.initialize().then(() => {
  // fireSocket initialized successfully
}).catch((error) => {

});
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
## Example website
```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title></title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">
  <style>
    html {
      height: 100%;
    }

    body {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: monospace;
      font-size: 16px;
    }

    #messagesContainer {
      width: 300px;
      height: 300px;
      border: 2px solid gray;
      overflow-y: scroll;
    }

    #messages {
      margin: 0;
    }

    #input {
      display: block;
      margin: 0;
      outline: 0;
      padding: 0;
      padding-top: 5px;
      padding-bottom: 5px;
      border-radius: 0;
      border: 2px solid gray;
      height: 20px;
      width: 300px;
      font-family: monospace;
      font-size: 16px;
      resize: none;
    }
  </style>
</head>

<body>
  <div id="mainContainer">
    <div id="messagesContainer">
      <pre id="messages"></pre>
    </div>
    <textarea id="input"></textarea>
  </div>
  <script type="module">
    import FireSocket from "https://nulljcd.github.io/firesocket/firesocket.js";

    function pushMessage(message) {
      document.querySelector("#messages").innerText += `${message}${"\n"}`;
      document.querySelector("#messages").scrollIntoView({
        block: "end"
      });
    }

    let fireSocket = new FireSocket(yourFirebaseConfig);

    fireSocket.initialize().then(() => {
      window.onkeydown = e => {
        document.querySelector("#input").focus();
        if (e.code == "Enter") {
          e.preventDefault();
          let broadcastData = document.querySelector("#input").value;
          if (broadcastData.length > 0)
            fireSocket.broadcast(broadcastData);
          document.querySelector("#input").value = "";
          document.querySelector("#input").blur();
        }
      };
    });

    fireSocket.onConnection = (userId) => pushMessage(`-> ${userId.substring(0, 6)}`);
    fireSocket.onDisconnection = (userId) => pushMessage(`<- ${userId.substring(0, 6)}`);
    fireSocket.onBroadcast = (userId, data) => pushMessage(`${userId.substring(0, 6)} ->${"\n"}${data}`);
  </script>
</body>

</html>
```
