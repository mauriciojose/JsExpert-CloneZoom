class SocketBuilder{
    constructor({ socketUrl }){
        this.socketUrl = socketUrl;
        this.onUserConnected = () => { };
        this.onUserDisconnected = () => { };
        this.onMessage = () => { };
    }

    setOnUserConnected(fn) {
        this.onUserConnected = fn;
        return this;
    }
    setOnUserDisconnected(fn) {
        this.onUserDisconnected = fn;
        return this;
    }

    setOnMessage(fn) {
        this.onMessage = fn;
        return this;
    }

    build() {
        const socket  = io.connect(this.socketUrl, {
            withCredentials: false
        });

        socket.on('user-connected', this.onUserConnected);
        socket.on('user-disconnected', this.onUserDisconnected);
        socket.on('message', this.onMessage);

        return socket;
    }
}