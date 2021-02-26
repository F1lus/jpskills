import {io} from 'socket.io-client'
import config from '../config'

export default class Socket{
    constructor(){
        this.socket = io(config.server_address,{withCredentials:true})
    }
}