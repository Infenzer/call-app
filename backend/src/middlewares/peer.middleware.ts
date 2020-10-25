import socket from "socket.io";
import { io } from '../app'

interface OfferSocket {
  offer: any,
  from: string,
  to: string
}

interface AnswerSocket {
  answer: any,
  from: string,
  to: string
}

interface CandidateSocket {
  to: string, 
  candidate: any
}

function peerSocket(socket: socket.Socket, next: () => void) {
  socket.on('offer', (offerS: OfferSocket) => {
    io.in(offerS.to).emit('offer', {from: offerS.from, offer: offerS.offer})
  })

  socket.on('answer', (answerS: AnswerSocket) => {
    io.in(answerS.to).emit('answer', answerS)
  })

  socket.on('candidate', (candidateS: CandidateSocket) => {
    io.in(candidateS.to).emit('candidate', candidateS.candidate)
  })

  next()
}

export default peerSocket