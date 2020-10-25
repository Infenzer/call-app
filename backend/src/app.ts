import express from 'express'
import cors from 'cors'
import http from 'http'
import socket from 'socket.io'
import Room from './utils/Room'
import peerSocket from './middlewares/peer.middleware'
import User from './utils/User'

const app = express()
const server = http.createServer(app)
export const io = socket(server)

app.use(cors())
io.use(peerSocket)

const rooms: Room[] = []

interface UserData {
  id: string,
  activeMic: boolean, 
  activeCamera: boolean,
}

io.on('connect', socket => {
  socket.on('join room', ({roomId}) => {
    const room = rooms.find(room => room.id === roomId)
    socket.join(roomId)

    if (room?.getUsers().length === 4) {
      return
    }

    if (room) {
      room.addUser(new User(socket.id))

      if (room.getUsers().length === 1) {
        const users = room.getUsers().filter(user => user.id !== socket.id)
        socket.emit('call', users.map(user => user.id))
        room.getUser(socket.id)?.setOwner()
      }

      io.in(roomId).emit('users media', room.getUsers())
    } else if (roomId) {
      const room = new Room(roomId)
      const user = new User(socket.id)
      room.setOwner(user)
      room.addUser(user)
      rooms.push(room)

      const users = room.getUsers().filter(user => user.id !== socket.id)
      socket.emit('all users', users.map(user => user.id))
      io.in(roomId).emit('users media', room.getUsers())
    }
  })

  socket.on('user data', (media: UserData) => {
    const room = rooms.find(room => room.hasUser(socket.id))
    if (room) {
      const user = room.getUser(media.id)

      if (user) {
        user.toggleCamera(media.activeCamera)
        user.toggleMic(media.activeMic)
      }

      socket.broadcast.emit('users media', room.getUsers())
    }
  })

  socket.on('call', () => {
    const room = rooms.find(room => room.hasUser(socket.id))
    if (room) {
      const users = room.getUsers().filter(user => user.id !== socket.id)
      socket.emit('call', users.map(user => user.id))
    }
  })

  socket.on('disconnect', () => {
    const room = rooms.find(room => room.hasUser(socket.id))

    if (room) {
      socket.broadcast.emit('user disconnect', socket.id)
      room.deleteUser(socket.id)

      const users = room.getUsers()
      if (users.length === 1) {
        users[0].setOwner();
        io.in(room.id).emit('users media', room.getUsers())
      }
    }
  })
}) 

server.listen(4200, () => {
  console.log('Server started')
})