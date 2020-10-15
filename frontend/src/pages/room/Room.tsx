import React, { useEffect, useRef } from 'react'
import { RouteChildrenProps } from 'react-router-dom'
import { RoomParam } from '../../App'
import Video from '../../components/video/Video'
import usePeer from '../../hooks/peer.hook'
import socket from '../../socket'

interface RoomProps extends RouteChildrenProps<RoomParam>{} 

const Room: React.FC<RoomProps> = (props) => {
  const roomId = props.match?.params.id
  const name = props.match?.params.name
  const [youVideo, peerItems] = usePeer()

  useEffect(() => {
    socket.emit('join room', {roomId, name})
    console.log(roomId, name)
  }, [])

  return (
    <div className='room'>
      <video width={250} height={250} autoPlay ref={youVideo} muted></video>
      {peerItems.map(item => <Video key={item.id} peerItem={item} />)}
    </div>
  )
}

export default Room