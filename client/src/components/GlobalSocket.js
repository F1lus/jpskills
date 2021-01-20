import {io} from 'socket.io-client'

export default class Socket{
    constructor(){
        this.socket = io('http://localhost:5000',{withCredentials:true})
    }
}