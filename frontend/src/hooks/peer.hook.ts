import React, { useEffect, useRef, useState } from 'react'
import socket from '../socket'

interface OfferSocket {
  from: string,
  offer: RTCSessionDescriptionInit
}

export interface PeerItem {
  id: string
  peer: RTCPeerConnection
  remoteStream: MediaStream
}

function usePeer(): [React.RefObject<HTMLVideoElement>, PeerItem[], MediaStream | null] {
  const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
  const [peerItems, setPeerItems] = useState<PeerItem[]>([])
  const [stream, setStream] = useState<MediaStream | null>(null)

  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let peers: PeerItem[] = []  
    socket.on('all users', (users: string[]) => {
      console.log(users)
      navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(stream => {
        setStream(stream)

        if (video) {
          video.current!.srcObject = stream
        }
        
        users.forEach(user => {
          const peerItem = createPeerItem(user, stream)
          peers.push({
            id: user,
            ...peerItem
          })
        })

        socket.on('offer', (message: OfferSocket) => {
          const peerItem = addPeerItem(message.from, message.offer, stream)
          const item = {
            id: message.from,
            ...peerItem
          }
          peers.push(item)
    
          setPeerItems([...peers])
        })

        setPeerItems(peers)
      }).catch(e => {
        console.log(e)
      })
    })

    socket.on('user disconnect', (userId: string) => {
      console.log(userId,  peers, peerItems)
      const fPeerItems = peers.filter(item => item.id !== userId)
      setPeerItems(fPeerItems)
      peers = fPeerItems
    })
  }, [])

  function createPeerItem(to: string, stream: MediaStream) {
    const peer = new RTCPeerConnection(configuration)
    const remoteStream = new MediaStream();

    peer.addEventListener('track', event => {
      remoteStream.addTrack(event.track)
    })

    peer.addEventListener('icecandidate', event => {
      if (event.candidate) {
        socket.emit('candidate', {to, candidate: event.candidate})
      }
    })

    socket.on('candidate', (candidate: RTCIceCandidate) => {
      peer.addIceCandidate(new RTCIceCandidate({sdpMLineIndex: candidate.sdpMLineIndex, candidate: candidate.candidate}))
    })

    socket.on('answer', (answer: RTCSessionDescriptionInit) => {
      peer.setRemoteDescription(new RTCSessionDescription(answer))
    })

    stream.getTracks().forEach(track => {
      peer.addTrack(track, stream)
    })

    peer.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: true}).then(offer => {
      peer.setLocalDescription(offer)
      console.log('send offer')
      socket.emit('offer', {offer, from: socket.id, to})
    })

    return {peer, remoteStream}
  }

  function addPeerItem(to: string, offer: RTCSessionDescriptionInit, stream: MediaStream) {
    const peer = new RTCPeerConnection(configuration)
    const remoteStream = new MediaStream();
    
    stream.getTracks().forEach(track => {
      peer.addTrack(track, stream)
    })

    peer.addEventListener('track', event => {
      remoteStream.addTrack(event.track)
    })

    peer.addEventListener('icecandidate', event => {
      if (event.candidate) {
        socket.emit('candidate', {to, candidate: event.candidate})
      }
    })

    socket.on('candidate', (candidate: RTCIceCandidate) => {
      peer.addIceCandidate(new RTCIceCandidate({sdpMLineIndex: candidate.sdpMLineIndex, candidate: candidate.candidate}))
    })

    peer.setRemoteDescription(new RTCSessionDescription(offer))
    peer.createAnswer().then(answer => {
      peer.setLocalDescription(answer)

      console.log('send answer')
      socket.emit('answer', {answer, from: socket.id, to})
    })
    
    return {peer, remoteStream}
  }

  return [video, peerItems, stream]
}

export default usePeer