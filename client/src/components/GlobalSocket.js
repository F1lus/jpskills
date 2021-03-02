import { createContext } from 'react'
import socketio from 'socket.io-client'

import config from '../config'

export const socket = socketio.io(config.server_address, {withCredentials:true})

export const SocketContext = createContext(socket)

