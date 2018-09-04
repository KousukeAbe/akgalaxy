'use strict';

class SocketClient {
    constructor (socket) {
        this.socket = socket;
        this.id = socket.id;
        this.user = socket.request.session.user;
        this.username = this.user.username;
        this.password = this.user.password;

        console.log(`new connected: ${this.id} , ${this.username}, ${this.password}`);

        this.socket.on('disconnect', this.disconnect.bind(this));
    }

    disconnect () {
        console.log(`disconnect: ${this.id} , ${this.username}`);
    }
}

module.exports = SocketClient;