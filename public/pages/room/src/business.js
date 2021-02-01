class Buisness {
    constructor({ room, media, view, socketBuilder, peerBuilder }){
        this.room = room;
        this.media = media;
        this.view = view;
        
        this.socketBuilder = socketBuilder;
        this.peerBuilder = peerBuilder;

        this.socket = {};

        this.currentStream = {};
        this.currentPeer = {};

        this.peers = new Map();
        this.usersRecordings = new Map();

        this.muted = true;
        this.video = true;

    }

    static initialize(deps){
        const instance = new Buisness(deps);
        return instance._init();
    }

    async _init() {

        this.view.configureRecordButton(this.onRecordPresser.bind(this));
        this.view.configureLeaveButton(this.onLeavePresser.bind(this));
        this.view.configureMutedButton(this.onMutedPresser.bind(this));
        this.view.configureVideoMutedButton(this.onVideoPresser.bind(this));

        this.currentStream = await this.media.getCamera(true);

        this.socket = this.socketBuilder
        .setOnUserConnected(this.onUserConnected())
        .setOnUserDisconnected(this.onUserDisconnected())
        .build();

        this.currentPeer = await this.peerBuilder
            .setOnError(this.onPeerError())
            .setOnConnectionOpened(this.onPeerConnectionOpened())
            .setOnCallReceived(this.onPeerCallReceived())
            .setOnPeerStreamReceived(this.onPeerStreamReceived())
            .setOnCallError(this.onPeerCallError())
            .setOnCallClose(this.onPeerCallClose())
            .build();

        this.addVideoStream(this.currentPeer.id);
    }

    addVideoStream(userId, stream = this.currentStream){
        const recorderInstance = new Recorder(userId, stream);
        this.usersRecordings.set(recorderInstance.filename, recorderInstance);
        if (this.recordingEnable) {
            recorderInstance.startRecording();
        }
        const isCurrentId = userId === this.currentPeer.id;
        this.view.renderVideo({
            userId,
            muted: true,
            stream,
            isCurrentId
        });
    }

    onUserConnected () {
        return userId => {
            console.log('user connected!', userId);
            this.currentPeer.call(userId, this.currentStream);
        }
    }

    onUserDisconnected () {
        return userId => {
            console.log('user disconnected!', userId);
            if (this.peers.has(userId)) {
                this.peers.get(userId).call.close();
                this.peers.delete(userId);
            }

            this.view.setParticipants(this.peers.size);
            this.stopRecording(userId);
            this.view.removeVideoElement(userId);
        }
    }

    onPeerError () {
        return error => {
            console.log('error on peer!', error);
        }
    }
    onPeerConnectionOpened () {
        return (peer) => {
            const id = peer.id;
            this.socket.emit('join-room',this.room,id);
        }
    }
    onPeerCallReceived () {
        return call => {
            console.log('answering!', call);
            call.answer(this.currentStream);
        }
    }
    onPeerStreamReceived () {
        return (call, stream) => {
            const callerId = call.peer;
            if (!this.peers.has(callerId)) {
                // this.peers.set(callerId, { call });
                this.addVideoStream(callerId, stream);
                this.peers.set(callerId, { call });
                this.view.setParticipants(this.peers.size);
            }
        }
    }

    onPeerCallError () {
        return (call, error) => {
            console.log('an call error ocurred!', error);
            this.view.removeVideoElement(call.peer);
        }
    }
    onPeerCallClose () {
        return (call) => {
            console.log('call closed!', call.peer);
        }
    }

    onRecordPresser(recordingEnable){
        this.recordingEnable = recordingEnable;
        for (const [key, value] of this.usersRecordings) {
            if (this.recordingEnable) {
                value.startRecording();
                continue;
            }
            this.stopRecording(key);
        }
    }

    // se o usuario entrou e saiu da call tem que parar todas as gravações dele
    async stopRecording(userId){
        const usersRecordings = this.usersRecordings;
        for (const [key, value] of usersRecordings) {
            const isContextUser = key.includes(userId);
            if(!isContextUser) continue;

            const rec = value;
            const isRecordingActive = rec.recordingActive;
            if(!isRecordingActive) continue;

            await rec.stopRecording();
            this.playRecordings(userId);
        }
    }

    playRecordings(userId) {
        const user = this.usersRecordings.get(userId);
        const videosURLs = user.getAllVideosURLs(userId);
        videosURLs.map(url => {
            this.view.renderVideo({ url, userId });
        });
    }

    onLeavePresser(){
        this.usersRecordings.forEach((value, key) => value.download());
    }
    onMutedPresser(){
        this.muted = !this.muted ;
        if (this.muted) {
            this.currentStream.getTracks()[0].enabled=this.muted;
        } else {
            this.currentStream.getTracks()[0].enabled=this.muted;
        }
        
        return {
            userId: this.currentPeer.id,
            muted: this.muted
        };
    }
    onVideoPresser(){
        this.video = !this.video ;
        if (this.video) {
            this.currentStream.getTracks()[1].enabled=this.video;
        } else {
            this.currentStream.getTracks()[1].enabled=this.video;
        }
        
        return {
            userId: this.currentPeer.id,
            video: this.video
        };
    }

}