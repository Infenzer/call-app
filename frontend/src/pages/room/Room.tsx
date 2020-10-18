import React, { useEffect, useState } from 'react'
import { RouteChildrenProps } from 'react-router-dom'
import { RoomParam } from '../../App'
import Video from '../../components/video/Video'
import usePeer from '../../hooks/peer.hook'
import socket from '../../socket'
import './room.scss'

interface RoomProps extends RouteChildrenProps<RoomParam>{} 

interface User {
  name: string
  id: string
  micActive: boolean
  cameraActive: boolean
}

const Room: React.FC<RoomProps> = (props) => {
  const roomId = props.match?.params.id
  const name = props.match?.params.name
  const [activeMic, setActiveMic] = useState(true)
  const [activeCamera, setActiveCamera] = useState(false)
  const [youVideo, peerItems, stream] = usePeer()
  const [usersMedia, setUsersMedia] = useState<User[]>([])

  useEffect(() => {
    socket.emit('join room', {roomId, name})

    socket.on('users media', (usersMedia: User[]) => {
      console.log(usersMedia)
      setUsersMedia(usersMedia)
    })

    console.log(roomId, name)
  }, [])

  useEffect(() => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = activeCamera
        //socket.emit('user media', {id: socket.id, activeMic, activeCamera})
      })
    }
  }, [stream])

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

  function hungUp() {

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
        <div className="interface-btn phone" onClick={() => hungUp()}>
          <i className="fas fa-phone"></i>
        </div>
      </div>
    </div>
  )
}

export default Room