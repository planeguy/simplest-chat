const io = require('socket.io-client');

module.exports.SimplestChatClient = class SimplestChatClient {
    constructor(opts){
        this.socket = io.connect('http://localhost:10101',{
            reconnect:opts.reconnect||false,
            query:{
                user:opts.user,
                node:opts.node
            }
        });
        this.user=opts.user;
        this.node=opts.node;
        this.colour;
    }
    sendMessage(message){
        socket.emit('message',{message});
    }
    getMessage(message){

    }
    getServerConnect(srvConnect){
        this.colour=srvConnect.colour;
    }
};

