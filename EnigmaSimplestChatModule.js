const {SimplestChatClient} = require('./SimplestChatClient.js');
const wrap = require('word-wrap');
const resetColour = "\x1b[0m";

//enigma1/2
const Log               = require('./logger.js').log;
const { MenuModule }    = require('./menu_module.js');
const {
    pipeToAnsi,
    stripMciColorCodes
}                       = require('./color_codes.js');
const stringFormat      = require('./string_format.js');
const StringUtil        = require('./string_util.js');
const Config            = require('./config.js').get;

exports.moduleInfo = {
    name        : 'Simplest Chat Client',
    desc        : 'Connects to a local simplest chat server',
    author      : 'planeguy',
    packageName : 'ca.delek.simplestchat'
};

class EnigmaSimplestChatModule extends MenuModule {
    constructor(opts){
        super(opts);
        this.log    = Log.child( { module : 'simplest-chat' } );
        this.config = Object.assign({}, _.get(opts, 'menuConfig.config'), { extraArgs : opts.extraArgs });

        this.chatClient = new SimplestChatClient({
            user:this.client.user.username,
            node:this.client.node
        });
        this.setupNetworkEvents(this.chatClient.socket);

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

    mciReady(mciData, err){
        super.mciReady(mciData,err=>!!err?err:null);

        
        async.series(
            [
                (callback) => {
                    return this.prepViewController('simplestChat', FormIds.simplestChat, mciData.menu, callback);
                },
                (callback) => {
                    return this.validateMCIByViewIds('simplestChat', [ MciViewIds.simplestChat.chatLog, MciViewIds.simplestChat.inputArea ], callback);
                },
                (callback) => {
                    return(callback);
                }
            ],
            err => {
                return cb(err);
            }
        );
    }

    setupNetworkEvents(socket){
        socket.on('message',(message)=>{
            let u = (!!message.user)?`${message.colour}${message.user}${resetColour}: `:''
            let m = (`${u}${message.message}`);
            
            const chatLogView = this.viewControllers.mrcChat.getView(MciViewIds.mrcChat.chatLog);
            const chatWidth = chatLogView.dimens.width;
            const chatHeight = chatLogView.dimens.height;

            chatLogView.addText(pipeToAnsi(wrap(m, {width:chatWidth})));

            if(chatLogView.getLineCount() > chatHeight) {
                chatLogView.deleteLine(0);
            }
        });
    }
    sendMessage(){
        const inputAreaView = this.viewControllers.mrcChat.getView(MciViewIds.mrcChat.inputArea);
        const inputData		= inputAreaView.getData();

        this.chatClient.sendMessage(inputData);
        inputAreaView.clearText();
    }
}

module.getModule = EnigmaSimplestChatModule;