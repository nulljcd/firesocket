import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getDatabase, ref, set, update, onDisconnect, remove, onValue } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

export default class FireSocket {
  constructor(firebaseConfig) {
    this.firebaseConfig = firebaseConfig;

    this.app = null;
    this.database = null;
    this.auth = null;

    this.userId;
    this.usersRef;
    this.userRef;
    this.userBroadcastFlag = 0;
    this.isConnected = false;
    this.lastUsersData = {};
    this.connectedUsers = [];

    this.onConnection = undefined;
    this.onDisconnection = undefined;
    this.onBroadcast = undefined;
  }

  initialize() {
    return new Promise((resolve, reject) => {
      this.app = initializeApp(this.firebaseConfig);
      this.database = getDatabase(this.app);
      this.auth = getAuth();

      onAuthStateChanged(this.auth, user => {
        if (user) {
          this.userId = user.uid;
          this.usersRef = ref(this.database, "users");
          this.userRef = ref(this.database, `users/${this.userId}`);

          this.connect().then(() => {
            resolve();
          }).catch((error) => {
            reject(error);
          });

          onDisconnect(this.userRef).remove();

          this.handleServer();
        }
      });

      signInAnonymously(this.auth).catch((error) => {
        reject(error);
      });
    });
  }

  handleServer() {
    onValue(this.usersRef, (snapshot) => {
      let usersData = snapshot.val();

      let endCallData = {
        type: null,
        userId: null,
        userBroadcastData: null
      };

      for (let key in usersData) {
        let userData = usersData[key];
        let lastUserData = this.lastUsersData[key];

        if (!lastUserData) {
          if (this.onConnection) {
            endCallData.type = "connection";
            endCallData.userId = userData.id;
          }

          if (this.userId === userData.id)
            this.isConnected = true;
        } else if (lastUserData.broadcastFlag != userData.broadcastFlag)
          if (this.onBroadcast && this.onBroadcast) {
            endCallData.type = "broadcast";
            endCallData.userId = userData.id;
            endCallData.userBroadcastData = userData.broadcastData;
          }
      }

      for (let key in this.lastUsersData) {
        let userData = usersData != null ? usersData[key] : null;
        let lastUserData = this.lastUsersData[key];

        if (userData == null) {
          if (this.onDisconnection) {
            endCallData.type = "disconnection";
            endCallData.userId = lastUserData.id;
          }

          if (lastUserData.id === this.userId)
            this.isConnected = false;
        }
      }

      this.lastUsersData = {};
      this.connectedUsers = [];

      for (let key in usersData) {
        let userData = usersData[key];

        this.lastUsersData[key] = userData;
        this.connectedUsers.push(userData.id);
      }

      switch (endCallData.type) {
        case "connection":
          this.onConnection(endCallData.userId);
          break;
        case "disconnection":
          this.onDisconnection(endCallData.userId);
          break;
        case "broadcast":
          this.onBroadcast(endCallData.userId, endCallData.userBroadcastData);
          break;
        default:
          break;
      }
    });
  }

  connect() {
    return new Promise((resolve, reject) => {
      set(this.userRef, {
        id: this.userId,
        broadcastData: "",
        broadcastFlag: this.userBroadcastFlag
      }).then(() => {
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      remove(this.userRef).then(() => {
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }

  broadcast(broadcastData) {
    return new Promise((resolve, reject) => {
      this.userBroadcastFlag = +!this.userBroadcastFlag;
      update(this.userRef, {
        broadcastData: broadcastData,
        broadcastFlag: this.userBroadcastFlag
      }).then(() => {
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }
}