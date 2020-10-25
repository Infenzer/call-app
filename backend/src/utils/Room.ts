import User from "./User"

export default class Room {
  readonly id: string = ''
  private owner?: User
  private password?: number
  private userList: User[] = []

  constructor( roomId: string) {
    this.id = roomId
  }

  setOwner(user: User) {
    this.owner = user
    user.setOwner()
  }

  addUser(user: User) {
    this.userList.push(user)
  }

  getUsers() {
    return this.userList
  }

  getUser(userId: string) {
    return this.userList.find(user => user.id === userId)
  }
  
  deleteUser(userId: string) {
    this.userList = this.userList.filter(user => userId !== user.id)
  }

  hasUser(userId: string) {
    return !!this.userList.find(user => user.id === userId)
  }

  isEmpty() {
    return !this.userList.length ? true : false
  }
}