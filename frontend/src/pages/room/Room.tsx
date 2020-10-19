import React, { useEffect, useRef, useState } from 'react'
import { RouteChildrenProps } from 'react-router-dom'
import { RoomParam } from '../../App'
import Video from '../../components/video/Video'
import usePeer from '../../hooks/peer.hook'
import socket from '../../socket'
import './room.scss'

interface RoomProps extends RouteChildrenProps<RoomParam>{} 

interface UserMedia {
  name: string
  id: string
  micActive: boolean
  cameraActive: boolean
}

const url = new URL(document.location.href)
const name = url.searchParams.get('name')
const videoCall = url.searchParams.get('video')

const constraints: MediaStreamConstraints = {
  audio: true,
  video: videoCall === 'true' ? true : false
}

const Room: React.FC<RoomProps> = (props) => {
  const roomId = props.match?.params.id
  const [activeMic, setActiveMic] = useState(true)
  const [activeCamera, setActiveCamera] = useState(false)
  const [usersMedia, setUsersMedia] = useState<UserMedia[]>([])
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [initConnect, setInitConnect] = useState(false)
  const [
    peerItems,
    connect,
    disconnect, 
    callUsers
  ] = usePeer()
  
  const youVideo = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    socket.emit('join room', {roomId, name})

    socket.on('users media', (usersMedia: UserMedia[]) => {
      console.log(usersMedia, socket.id)
      setUsersMedia(usersMedia)
    })

    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      setStream(stream)
    }).catch(e => {
      console.log(e)
    })

    console.log(roomId, name)
  }, [])
  
  useEffect(() => {
    if (stream && callUsers?.length === 0) {
      console.log('hell')
      setInitConnect(true)
      connect(stream)
    }
  }, [stream, callUsers])

  function toggleMic() {
    if (stream) {
      setActiveMic(prevState => !prevState)
      stream.getAudioTracks().forEach(track => {
        track.enabled = !activeMic
      })
      socket.emit('user media', {id: socket.id, activeMic: !activeMic, activeCamera})
    }
  }

  function toggleCamera() {
    if (stream) {
      setActiveCamera(prevState => !prevState)
      stream.getVideoTracks().forEach(track => {
        track.enabled = !activeCamera
      })
      socket.emit('user media', {id: socket.id, activeMic, activeCamera: !activeCamera})
    }
  }

  function screenSharing() {
    // @ts-ignore
    navigator.mediaDevices.getDisplayMedia({video: true, audio: true}).then(displayStreem => {
      if (youVideo.current) {
        youVideo.current.srcObject = displayStreem
      }

      const videoTack = displayStreem.getVideoTracks()[0]
      peerItems.forEach(item => {
        const senderVideo = item.peer.getSenders()[1]
        senderVideo.replaceTrack(videoTack)
      })
    })
    
  }

  function call() {
    if (stream) {
      connect(stream)
    }
  }

  function hungUp() {
    // peerItems[0].peer.close()
    // console.log(peerItems[0])
    // screenSharing()
  }

  function getUserMedia(type: 'mic' | 'camera', userId: string) {
    const user = usersMedia.find(user => user.id === userId)

    if (type === 'mic' && user) {
      return user.micActive
    } else if (type === 'camera' && user) {
      return user.cameraActive
    }

    return false
  }

  const phoneClass = peerItems.length ? 'hung-up' : 'call'
  return (
    <div className='room'>
      <div className="users-video-wrapper">
        <div className="video">
          <video width={250} height={250} autoPlay ref={youVideo} muted></video>
        </div>
        {peerItems.map(item => <Video key={item.id} 
          peerItem={item}
          disabledCamera={!getUserMedia('camera', item.id)}
          disabledMic={!getUserMedia('mic', item.id)} 
        />)}
      </div>
      <div className="user-interface">
        <div className="interface-btn mic" onClick={() => toggleMic()}>
          {activeMic && (
            <i className="fas fa-microphone"></i>
          )}
          {!activeMic && (
            <i className="fas fa-microphone-slash disable"></i>
          )}
        </div>
        <div className="interface-btn camera" onClick={() => toggleCamera()}>
          {activeCamera && (
            <i className="fas fa-video"></i>
          )}
          {!activeCamera && (
            <i className="fas fa-video-slash disable"></i>
          )}
        </div>
        {(callUsers !== null && callUsers.length > 0 && usersMedia.length > 1) && (
          <div className={'interface-btn ' + phoneClass} onClick={() => peerItems.length ? hungUp() : call()}>
            <i className="fas fa-phone"></i>
          </div>
        )}
      </div>
    </div>
  )
}

export default Room