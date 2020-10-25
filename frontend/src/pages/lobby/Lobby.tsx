import React from 'react'
import { v4 as uuid } from 'uuid'
import './lobby.scss'

const Lobby: React.FC = () => {
  function createRoom(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const roomId = uuid()
    window.location.assign(`/room/${roomId}`)
  }

  return (
    <div className='lobby'>
      <a className='btn' onClick={(e) => createRoom(e)}>Создать комнату</a>
    </div>
  )
}

export default Lobby