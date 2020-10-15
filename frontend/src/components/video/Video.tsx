import React, { useEffect, useRef } from 'react'
import { PeerItem } from '../../hooks/peer.hook'

interface VideoProps {
  peerItem: PeerItem 
}

const Video: React.FC<VideoProps> = (props) => {
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (video && video.current) {
      video.current.srcObject = props.peerItem.remoteStream
    }
    
  }, [])

  return (
    <video width={250} height={250} autoPlay ref={video}></video>
  )
}

export default Video