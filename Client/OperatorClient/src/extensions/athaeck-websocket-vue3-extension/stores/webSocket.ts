import { defineStore } from 'pinia'
import type { SendEvent } from '../helper/types'
import bus from '@/hooks/index'

export const useWebSocketStore = defineStore({
  id: 'websocket',
  state: () => ({
    socket: null as WebSocket | null
  }),
  actions: {
    Init(): void { },
    Connect(): void {
      const WEBSOCKET_ADDRESS = import.meta.env.VITE_WEBSOCKET_ADDRESS;

      this.socket = new WebSocket(WEBSOCKET_ADDRESS)

      this.socket.addEventListener('message', this._OnMessage)
      this.socket.addEventListener('open', this._OnOpen)
      this.socket.addEventListener('close', this._OnClose)
      this.socket.addEventListener('error', this._OnError)
    },
    _OnMessage(message: any): void {
      const body: any = JSON.parse(message.data)

      bus.emit('TAKE_MESSAGE', body)
    },
    _OnClose(event: any): void {
      console.log(event)
      bus.emit("SOCKET_CLOSED")
    
      this.Connect()
    },
    _OnOpen(event: any): void {
      console.log(event)
      bus.emit("SOCKET_OPENED")
    },
    _OnError(event: any): void {
      console.log(event)
      bus.emit("SOCKED_ERROR")
      this.Connect()
    },
    SendEvent(event: SendEvent): void {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(event.JSONString)
      } else {
        console.error('WebSocket not open')
      }
    },
    Disconnect() {
      if (this.socket === null) {
        return
      }

      this.socket.removeEventListener('message', this._OnMessage)
      this.socket.removeEventListener('open', this._OnOpen)
      this.socket.removeEventListener('close', this._OnClose)
      this.socket.removeEventListener('error', this._OnError)

      this.socket.close()
      this.socket = null
    }
  },
})
