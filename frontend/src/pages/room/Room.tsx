import React, { useEffect, useState } from 'react'
import { RouteChildrenProps } from 'react-router-dom'
import { RoomParam } from '../../App'
import Video from '../../components/video/Video'
import usePeer from '../../hooks/peer.hook'
import socket from '../../socket'
import './room.scss'

interface RoomProps extends RouteChildrenProps<RoomParam>{} 

interface MicState {
  userId: string,
  active: boolean
}

const Room: React.FC<RoomProps> = (props) => {
  const roomId = props.match?.params.id
  const name = props.match?.params.name
  const [activeMic, setActiveMic] = useState(true)
  const [activeCamera, setActiveCamera] = useState(false)
  const [youVideo, peerItems, stream] = usePeer()
  const [disableMicUsers, setDisableMicUsers] = useState<string[]>([])
  const [disabeCameraUsers, setDisableCameraUsers] = useState<string[]>([])

  useEffect(() => {
    socket.emit('join room', {roomId, name})

    socket.on('camera state', (cameraState: MicState) => {
      if (!cameraState.active) {
        setDisableCameraUsers(prevState => [...prevState, cameraState.userId])
      } else {
        setDisableCameraUsers(prevState => prevState.filter(userId => userId !== cameraState.userId))
      }
    })

    socket.on('mic state', (micState: MicState) => {
      if (!micState.active) {
        setDisableMicUsers(prevState => [...prevState, micState.userId])
      } else {
        setDisableMicUsers(prevState => prevState.filter(userId => userId !== micState.userId))
      }
    })
    console.log(roomId, name)
  }, [])

  useEffect(() => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = activeCamera
        socket.emit('camera state', {userId: socket.id, active: activeCamera})
      })
    }
  }, [stream])

  function toggleMic() {
    if (stream) {
      setActiveMic(prevState => !prevState)
      stream.getAudioTracks().forEach(track => {
        track.enabled = !activeMic
        socket.emit('mic state', {userId: socket.id, active: !activeMic})
      })
    }
  }

  function toggleCamera() {
    if (stream) {
      setActiveCamera(prevState => !prevState)
      stream.getVideoTracks().forEach(track => {
        track.enabled = !activeCamera
        socket.emit('camera state', {userId: socket.id, active: !activeCamera})
      })
    }
  }

  function hungUp() {

  }

  return (
    <div className='room'>
      <div className="users-video-wrapper">
        <div className="video">
          <video width={250} height={250} autoPlay ref={youVideo} muted></video>
        </div>
        {peerItems.map(item => <Video key={item.id} 
          peerItem={item}
          disabledCamera={disabeCameraUsers.includes(item.id)}
          disabledMic={disableMicUsers.includes(item.id)} 
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