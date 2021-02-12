class View{
    constructor(){
        this.recorderBnt = document.getElementById('record');
        this.leaveBnt = document.getElementById('leave');
        this.muteBnt = document.getElementById('mute');
        this.videoMuteBnt = document.getElementById('video-mute');

        this.sendMsgBnt = document.getElementById('sendMsg');

        this.textMessage = document.getElementById('chat_message');

        this.listMessages = document.getElementById('listMessages');

        this.textMessage.addEventListener('keyup', this.click.bind(this));
    }

    click(event){
        console.log(this);
        if (event.keyCode == 13) {
            event.preventDefault();
            this.sendMsgBnt.click();
        }
    }

    createVideoElement({ muted = true, src, srcObject }){
        const video = document.createElement('video');
        video.muted = muted;
        video.src = src;
        video.srcObject = srcObject;

        if (src) {
            video.controls = true;
            video.loop = true;
            Util.sleep(200).then(_ => video.play());
        }

        if (srcObject) {
            video.addEventListener('loadedmetadata', _ => video.play())
        }

        return video;
    }

    renderVideo({ userId, stream = null, url = null, isCurrentId = false}){
        const video = this.createVideoElement({ 
            muted: isCurrentId, 
            src: url, 
            srcObject: stream 
        });
        this.appendToHTMLTree(userId, video, isCurrentId);
    }

    appendToHTMLTree(userId, video, isCurrentId) {
        const div = document.createElement('div');
        div.id = userId;
        div.classList.add('wrapper');
        div.append(video);
        const div2 = document.createElement('div');
        div2.innerText = isCurrentId ? '': userId;

        div.append(div2);

        const videoGrid = document.getElementById('video-grid');
        videoGrid.append(div);
    }

    setParticipants(count){
        const myself = 1;
        const participants = document.getElementById('participants');
        participants.innerHTML = (count + myself);
    }

    removeVideoElement(id) {
        const element = document.getElementById(id);
        element.remove();
    }

    tooggleRecordingButtonColor(isActive = true){
        this.recorderBnt.style.color = this.recordingEnabled ? 'red' : 'white';
    }

    onRecordClick (command) {
        this.recordingEnabled = false
        return () => {
          const isActive = this.recordingEnabled = !this.recordingEnabled;

          command(this.recordingEnabled);
          this.tooggleRecordingButtonColor(isActive);

        }
    }

    onLeaveClick (command) {
        return async() => {

            command();
  
            await Util.sleep(3000);
            
            window.location = '/pages/home';
          }
    }

    onMutedClick (command) {
        return async() => {
            const muted = command();
            let iconBtn = document.querySelector(`div.main__controls div.main__controls__block div.main__mute_button i`);
            if (!muted.muted) {
                iconBtn.classList.remove('fa-microphone');
                iconBtn.classList.add('fa-microphone-slash');
            } else {
                iconBtn.classList.remove('fa-microphone-slash');
                iconBtn.classList.add('fa-microphone');
            }
            
          }
    }
    onVideoMutedClick (command) {
        return async() => {
            const muted = command();
            
            let iconBtn = document.querySelector(`div.main__controls div.main__controls__block div.main__video_button i`);
            if (!muted.video) {
                iconBtn.classList.remove('fa-video');
                iconBtn.classList.add('fa-video-slash');
            } else {
                iconBtn.classList.remove('fa-video-slash');
                iconBtn.classList.add('fa-video');
            }
            
          }
    }

    configureRecordButton(command){
        this.recorderBnt.addEventListener('click', this.onRecordClick(command));
    }

    configureLeaveButton(command){
        this.leaveBnt.addEventListener('click', this.onLeaveClick(command));
    }

    configureMutedButton(command){
        this.muteBnt.addEventListener('click', this.onMutedClick(command));
    }
    configureVideoMutedButton(command){
        this.videoMuteBnt.addEventListener('click', this.onVideoMutedClick(command));
    }

    configureSendMsgButton(command){
        this.sendMsgBnt.addEventListener('click', this.onSendMsgClick(command));
    }

    onSendMsgClick (command) {
        return async() => {
            const comando = command();
            comando.emit('message', this.textMessage.value);
            this.setMessageEmit(this.textMessage.value);
            this.textMessage.value = "";
            this.textMessage.focus();
            // console.log(comando);
          }
    }

    setMessage(message){
        this.listMessages.innerHTML += `
        <div class="message received">
            <span class="">
                ${message}
            </span>
        </div>
        <div style="clear: both;"></div>
        `;
    }

    setMessageEmit(message){
        this.listMessages.innerHTML += `
        <div class="message emit">
            <span class="">
                ${message}
            </span>
        </div>
        <div style="clear: both;"></div>
        `;
    }

}