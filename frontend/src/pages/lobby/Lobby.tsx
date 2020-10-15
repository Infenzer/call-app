import React, { useState } from 'react'
import { v4 as uuid } from 'uuid'

const Lobby: React.FC = () => {
  const [name, setName] = useState('123')

  function createRoom() {
    const roomId = uuid()
    window.location.assign(`/room/${roomId}/${name}`)
  }

  return (
    <div className='lobby' onClick={() => createRoom()}>
      <button>Создать комнату</button>
    </div>
  )
}

export default Lobby