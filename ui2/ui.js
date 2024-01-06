
const port = 7801 ; //this port refers to the backend port
const backendUrl = `http://localhost:${port}`;
console.log(backendUrl);

const socket = io(backendUrl);

socket.on('connect',()=>{
    //do connect type stuff
    console.log(`from ui : socket id is [${socket.id}]`)
});



// when server send the event called "serverInfo" , the below listener is executed
socket.on('serverInfo',(dataFromServer)=>{

    if(!dataFromServer){
        return;
    }
    console.log(dataFromServer);
    const timeStamp = dataFromServer.timeStamp;
    const serverId = dataFromServer.entityId;
    const playerDataList = dataFromServer.data || []
    const playerCount = playerDataList.length;
    const ids = playerDataList.map(x=>x.socketId).sort();

    document.querySelector('#server-greeting-ul').innerHTML = ``
    document.querySelector('#server-greeting-ul').innerHTML += `<li>timeStamp : ${timeStamp}</li>`
    document.querySelector('#server-greeting-ul').innerHTML += `<li>serverId : ${serverId}</li>`
    document.querySelector('#server-greeting-ul').innerHTML += `<li>playerCount : ${playerCount}</li>`
    document.querySelector('#server-greeting-ul').innerHTML += `<li>ids : ${ids}</li>`

    // document.querySelector('#server-greeting').innerHTML += JSON.stringify(data);
});


// when server broadcasts the msg , the below listener is executed
socket.on('newMessageToClients',(data)=>{
    document.querySelector('#messages').innerHTML += `<li>${data.fromServer}</li>`
});


// when user click on send button from ui , the current socket emit the below to server
document.querySelector('#message-form').addEventListener('submit',(event)=>{
    event.preventDefault();
    const inputText = document.querySelector('#user-message').value
    console.log(inputText);
    socket.emit('newChatMsgFromClient',{fromClient : inputText});
});
