import React, { useEffect, useRef, useState } from 'react'
import { PeerItem } from '../../hooks/peer.hook'
import './video.scss'

interface VideoProps {
  peerItem: PeerItem 
  disabledMic: boolean
  disabledCamera: boolean
}

let prevVolume = 0

const Video: React.FC<VideoProps> = (props) => {
  const video = useRef<HTMLVideoElement>(null)

  const [volume, setVolume] = useState(0)

  useEffect(() => {
    if (video && video.current) {
      video.current.srcObject = props.peerItem.remoteStream
    }
  }, [])

  function onVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setVolume(Number(e.target.value))
    if (video.current) {
      video.current.volume = Number(e.target.value)
    }
  }

  function toggleVolume() {
    if (volume === 0) {
      setVolume(prevVolume === 0 ? 1 : prevVolume)
    } else {
      prevVolume = volume
      setVolume(0)
    }
  }

  return (
    <div className="video">
      <video muted={volume === 0} autoPlay ref={video}></video>
      <div className="audio">
          <div className="volume-input">
            <input type="range" 
              step="0.01" 
              min="0" 
              max="1" 
              value={volume} 
              id="volume" 
              onChange={e => onVolumeChange(e)}
            />
          </div>
          <div className="volume-icon" onClick={() => toggleVolume()}>
            {volume > 0.7 && (
              <i className="fas fa-volume-up"></i>
            )}
            {volume <= 0.7 && volume !== 0 && (
              <i className="fas fa-volume-down"></i>
            )}
            {volume === 0 && (
              <i className="fas fa-volume-mute"></i>
            )}
          </div>
        </div>
        {props.disabledMic && (
          <div className="disable-mic">
            <i className="fas fa-microphone-slash"></i>
          </div>
        )}
        {props.disabledCamera && (
          <div className="disable-camera">
             <i className="fas fa-video-slash"></i>
          </div>
        )}
    </div>
  )
}

export default Video