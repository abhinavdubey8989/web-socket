



// used to check modularity only
export function sendMsg(io, data){
    io.emit('newMessageToClients' , {fromServer : data.fromClient})
}