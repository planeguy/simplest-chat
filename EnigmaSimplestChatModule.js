const {SimplestChatClient} = require('./SimplestChatClient.js');
const wrap = require('word-wrap');
const resetColour = "\x1b[0m";
const enigmaCore = '../../core';

//enigma1/2
const Log               = require(`${enigmaCore}/logger.js`).log;
const { MenuModule }    = require(`${enigmaCore}/menu_module.js`);
const {
    pipeToAnsi
}                       = require(`${enigmaCore}/color_codes.js`);
exports.moduleInfo = {
    name        : 'Simplest Chat Client',
    desc        : 'Connects to a local simplest chat server',
    author      : 'planeguy',
    packageName : 'ca.delek.simplestchat'
};

const FormIds = {
    simplestChat    : 0
};

const MciViewIds = {
    simplestChat  : {
        chatLog             : 1,
        inputArea           : 2,

        customRangeStart    : 20   //  20+ = customs
    }
};

class EnigmaSimplestChatModule extends MenuModule {
    constructor(opts){
        super(opts);
        this.log    = Log.child( { module : 'simplest-chat' } );

        this.menuMethods={
            sendMessage: (formData, extraArgs, cb)=>{
                this.sendMessage();
                return cb(null);
            },
            quit: (formData, extraArgs, cb) => {
                return this.prevMenu(cb);
            }
        }
    }

    mciReady(mciData, cb){
        super.mciReady(mciData, (err)=>{
            if(err) return cb(err);

            async.series(
                [
                    (callback) => {
                        return this.prepViewController('simplestChat', FormIds.simplestChat, mciData.menu, callback);
                    },
                    (callback) => {
                        return this.validateMCIByViewIds('simplestChat', [ MciViewIds.simplestChat.chatLog, MciViewIds.simplestChat.inputArea ], callback);
                    },
                    (callback)=>{
                        this.chatLogView = this.viewControllers.simplestChat.getView(MciViewIds.simplestChat.chatLog);
                        this.chatWidth = chatLogView.dimens.width;
                        this.chatHeight = chatLogView.dimens.height;
                        this.chatClient = new SimplestChatClient({
                            user:this.client.user.username,
                            node:this.client.node
                        });
                        this.setupNetworkEvents(this.chatClient.socket);
                        return callback;
                    }
                ],
                err => {
                    return cb(err);
                }
            );
        });
    }

    setupNetworkEvents(socket){
        socket.on('message',(message)=>{
            //if a user with colour format it so
            let u = (!!message.user)?`${message.colour}${message.user}${resetColour}: `:'';
            let m = (`${u}${message.message}`);
            this.addToChatlog(m);
            this.chatClient.getMessage(message);
        });
        socket.on('serverconnect',(srvc)=>{
            this.addToChatlog(`Connected to ${srvc.title}`);
            this.chatClient.getServerConnect(srvc);
        });
    }
    sendMessage(){
        const inputAreaView = this.viewControllers.simplestChat.getView(MciViewIds.simplestChat.inputArea);
        const inputData		= inputAreaView.getData();

        this.chatClient.sendMessage(inputData);
        inputAreaView.clearText();
    }
    addToChatlog(text){
        this.chatLogView.addText(pipeToAnsi(wrap(text, {width:this.chatWidth})));

        while(this.chatLogView.getLineCount() > this.chatHeight) {
            this.chatLogView.deleteLine(0);
        }

    }
}

exports.getModule = EnigmaSimplestChatModule;