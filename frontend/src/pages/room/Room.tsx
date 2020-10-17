import React, { useEffect, useRef, useState } from 'react'
import { RouteChildrenProps } from 'react-router-dom'
import { RoomParam } from '../../App'
import Video from '../../components/video/Video'
import usePeer from '../../hooks/peer.hook'
import socket from '../../socket'
import './room.scss'

interface RoomProps extends RouteChildrenProps<RoomParam>{} 

const Room: React.FC<RoomProps> = (props) => {
  const roomId = props.match?.params.id
  const name = props.match?.params.name
  const [activeMic, setActiveMic] = useState(true)
  const [youVideo, peerItems, stream] = usePeer()

  useEffect(() => {
    socket.emit('join room', {roomId, name})
    console.log(roomId, name)
  }, [])

  function toggleMic() {
    if (stream) {
      setActiveMic(prevState => !prevState)
      stream.getAudioTracks().forEach(track => {
        track.enabled = !activeMic
        console.log(track)
      })
    }
  }

  return (
    <div className='room'>
      <div className="video">
        <video width={250} height={250} autoPlay ref={youVideo} muted></video>
      </div>
      {peerItems.map(item => <Video key={item.id} peerItem={item} />)}
      <div className="user-interface">
        <h1>Interface</h1>
        <button onClick={() => toggleMic()}> {activeMic ? 'Вкл.' : 'Выкл.'} </button>
      </div>
    </div>
  )
}

export default Room