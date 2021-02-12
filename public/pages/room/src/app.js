const onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const room = urlParams.get('room');
  console.log('this is the room', room)

  const socketUrl = 'http://localhost:3000';
  // const socketUrl = "https://hidden-beach-32915.herokuapp.com";
  const socketBuilder = new SocketBuilder({ socketUrl });

  const peerConfig = Object.values({
    id: undefined,
    config: {
      host: 'gentle-castle-44029.herokuapp.com',
      secure: true,
      //port: 9000,
      //host: 'localhost',
      path: '/'
    }
  });
  const peerBuilder = new PeerBuilder({ peerConfig });

  const view = new View();
  const media = new Media();
  const deps = {
    view,
    media,
    room,
    socketBuilder,
    peerBuilder
  };

  Buisness.initialize(deps);
  // view.renderVideo({ userId:  'teste01', url: "https://media.giphy.com/media/JSYdrWZxVj2exhoTcc/giphy.mp4"});
  // view.renderVideo({ userId:  'teste02', isCurrentId:true, url: "https://media.giphy.com/media/JSYdrWZxVj2exhoTcc/giphy.mp4"});

}

window.onload = onload