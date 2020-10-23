import React, { useEffect, useRef, useState } from 'react'
import socket from '../socket'

interface OfferSocket {
  from: string,
  offer: RTCSessionDescriptionInit
}

interface AnswerSocket {
  answer: RTCSessionDescriptionInit,
  from: string,
  to: string
}

export interface PeerItem {
  id: string
  peer: RTCPeerConnection
  remoteStream: MediaStream
}

let peers: PeerItem[] = [] 

function usePeer(): [PeerItem[], (mediaStream: MediaStream, users?: string[]) => void, () => void, string[] | null] {
  const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
  const [peerItems, setPeerItems] = useState<PeerItem[]>([])
  const [callUsers, setCallUsers] = useState<string[] | null>(null)

  useEffect(() => { 
    socket.on('all users', (users: string[]) => {
      console.log(users, socket.id)
      setCallUsers(users)
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
    
    peer.setRemoteDescription(new RTCSessionDescription(offer))
    peer.createAnswer().then(answer => {
      peer.setLocalDescription(answer)

      console.log('send answer')
      socket.emit('answer', {answer, from: socket.id, to})
    })
    
    return {peer, remoteStream}
  }

  function connect(stream: MediaStream, users?: string[]) {
    const userList = users ? users : callUsers
    userList?.forEach(user => {
      const peerItem = createPeerItem(user, stream)
      peers.push({
        id: user,
        ...peerItem
      })
    })

    setPeerItems(peers)

    socket.on('offer', (message: OfferSocket) => {
      const peerItem = addPeerItem(message.from, message.offer, stream)
      const item = {
        id: message.from,
        ...peerItem
      }
      peers.push(item)

      setPeerItems([...peers])
    })

    socket.on('answer', (message: AnswerSocket) => {
      const peer = peers.find(peer => peer.id === message.from)?.peer
      
      if (peer) {
        peer.setRemoteDescription(new RTCSessionDescription(message.answer))
      }
    })

    socket.on('candidate', (candidate: RTCIceCandidate) => {
      peers.forEach(item => {
        item.peer.addIceCandidate(new RTCIceCandidate({
          sdpMLineIndex: candidate.sdpMLineIndex,
          candidate: candidate.candidate
        }))
      })
    })
  }

  function disconnect() {
    peerItems.forEach(item => {
      item.peer.close()
    })
    socket.disconnect()
    setPeerItems([])
  }

  return [peerItems, connect, disconnect, callUsers]
}

export default usePeer