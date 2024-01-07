

const port = 7800;
const backendUrl = `http://localhost:${port}`;
const socket = io.connect(backendUrl);


// client confirms (by clicking on spawn modal) that its ready to play now
// client will emit the player-name to server
const init = async () => {

    console.log(`inside init ...`);
    const dataFromServer = await socket.emitWithAck('ui-init', {
        playerName: uiCurrentPlayer.name
    });

    sendDataToServer();
    uiOrbList = dataFromServer.mainData.orbList;
    uiCurrentPlayer.socketId = dataFromServer.mainData.socketId;
    console.log(uiOrbList);
    draw();
}


socket.on('server-tick', (serverData) => {
    uiPlayerList = serverData.mainData;
    const currPlayer = uiPlayerList.filter(x => x.socketId === uiCurrentPlayer.socketId);
    if (!currPlayer) {
        return;
    }

    uiCurrentPlayer.x = currPlayer.x;
    uiCurrentPlayer.y = currPlayer.y;
    console.log(`inside server-tick , uiCurrentPlayer=[${JSON.stringify(uiCurrentPlayer)}]`);
    draw();
});

function sendDataToServer() {
    const fn = () => {
        socket.emit('ui-tock', uiCurrentPlayer)
    };
    setInterval(fn, 33);
}