import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Peer from 'peerjs';

function Room() {
  const { roomId } = useParams();
  const [peerId, setPeerId] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peer, setPeer] = useState(null);

  useEffect(() => {
    const newPeer = new Peer(undefined, {
      host: '0.peerjs.com',
      port: 443,
      path: '/'
    }); // Using the default PeerJS public server
    setPeer(newPeer);

    newPeer.on('open', (id) => {
      setPeerId(id);
      setIsLoading(false);
    });

    newPeer.on('call', async (incomingCall) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;
        incomingCall.answer(stream);
        incomingCall.on('stream', (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          setIsCalling(true);
        });
      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    });

    return () => {
      if (newPeer) {
        newPeer.destroy();
      }
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStartCall = async () => {
    if (!peer || !roomId) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;

      const call = peer.call(roomId, stream);

      call.on('stream', (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
        setIsCalling(true);
        setIsLoading(false);
      });
    } catch (err) {
      console.error('Failed to get local stream:', err);
      setIsLoading(false);
    }
  };

  const handleEndCall = () => {
    if (peer) {
      peer.disconnect();
      setIsCalling(false);
      setIsLoading(false);
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    }
  };

  return (
    <div>
      <h2>Room: {roomId}</h2>
      <div className="video-container">
        <video ref={localVideoRef} autoPlay muted width="400" height="300"></video>
        <video ref={remoteVideoRef} autoPlay width="400" height="300"></video>
      </div>
      <div>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {isCalling ? (
              <button onClick={handleEndCall}>End Call</button>
            ) : (
              <button onClick={handleStartCall}>Start Call</button>
            )}
          </div>
        )}
      </div>
      <div>
        <h3>Your Peer ID: {peerId}</h3>
      </div>
    </div>
  );
}

export default Room;
