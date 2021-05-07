function simplestChatClient(callingMenu, formData, extraArgs, callback){
    const startClient = require('./client-function.js');
    let user, node;
    if (extraArgs && extraArgs.length>0){
        user = extraArgs[0];
    } else {
        user = `rando-${Math.random()}`;
    }
    if (extraArgs && extraArgs.length>1){
        node = extraArgs[1];
    } else {
        node = 0
    }
    startClient(user, node);
}
module.exports = simplestChatClient;