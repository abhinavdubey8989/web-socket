

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
    if (!currPlayer || !currPlayer.length) {
        return;
    }

    uiCurrentPlayer.x = currPlayer[0].x;
    uiCurrentPlayer.y = currPlayer[0].y;
    console.log(`inside server-tick , uiCurrentPlayer=[${JSON.stringify(uiCurrentPlayer)}]`);
});

function sendDataToServer() {
    const fn = () => {
        socket.emit('ui-tock', uiCurrentPlayer)
    };
    setInterval(fn, 33);
}


//the server just told us that an orb was absorbed. Replace it in the orbs array!
socket.on('server-orb-update', (serverOrbData) => {
    // orbs.splice(orbData.capturedOrbI, 1, orbData.newOrb);

    const orbIdxRemoved = serverOrbData.mainData.orbIdxRemoved;
    const newOrbData = serverOrbData.mainData.newOrbData;

    uiOrbList.splice(orbIdxRemoved , 1 , newOrbData);
});


socket.on('server-player-absorbed', serverAbsorbData=>{

    document.querySelector('#game-message').innerHTML = `${serverAbsorbData.mainData.removedPlayerName} was absorbed by ${serverAbsorbData.mainData.updatedPlayer.playerPublicData.name}`
    document.querySelector('#game-message').style.opacity = 1;
    window.setTimeout(()=>{
        document.querySelector('#game-message').style.opacity = 0;
    },2000)
})