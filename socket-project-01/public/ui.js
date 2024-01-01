
const port = 3000 ; //this port refers to the backend port
const backendUrl = `http://localhost:${port}`;

const socket = io(backendUrl);

socket.on('connect',()=>{
    //do connect type stuff
    console.log(`from ui : socket id is [${socket.id}]`)
})


// when server broadcasts the msg , the below listener is executed
socket.on('newMessageToClients',(data)=>{
    document.querySelector('#messages').innerHTML += `<li>${data.fromServer}</li>`
});


// when user click on send button from ui , the current socket emit the below to server
document.querySelector('#message-form').addEventListener('submit',(event)=>{
    event.preventDefault();
    const inputText = document.querySelector('#user-message').value
    console.log(inputText);
    socket.emit('newChatMsgFromClient',{fromClient : inputText})
})
