export default class User {
  name: string
  id: string
  micActive: boolean = true
  cameraActive: boolean = true
  owner: boolean = false
  
  constructor(id: string, name?: string) {
    this.id = id

    if (!name) {
      this.name = this.id.slice(0, 6)
    } else {
      this.name = name
    }
  }

  setOwner() {
    this.owner = true;
  }

  setName(name: string) {
    this.name = name
  }

  toggleMic(active: boolean) {
    this.micActive = active
  }

  toggleCamera(acive: boolean) {
    this.cameraActive = acive
  }
}