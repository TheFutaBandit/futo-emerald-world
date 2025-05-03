import { WebSocket, WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3452 });

interface Player {
    id: string,
    x: number,
    y: number
}

let players = new Map<string, Player>();

interface message {
    type: string,
    payload: any
}

const spawnPoints = [{x: 241, y: 1163},{x: 466, y: 1168},{x: 111, y: 920},{x: 462, y: 905},{x: 691, y: 901}];

const getRandomSpawn = () => {
    const len = spawnPoints?.length;
    if(!spawnPoints) {
        return {
            x: 0,
            y: 0
        }
    }
    return (spawnPoints[Math.floor(Math.random() * len!)]);
}

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  let clientId = crypto.randomUUID();

  console.log(`socket no.${clientId} has connected.`);

  const randomSpawn = getRandomSpawn();

  players.set(clientId, {
        id: clientId,
        x: randomSpawn?.x ?? 1163,
        y: randomSpawn?.y ?? 241
    })

  ws.send(JSON.stringify({
        type: "init",
        payload: {
            player: players.get(clientId),
            players: Array.from(players.values())
        },
    }));

  broadcast({
    type: "player-joined",
    payload: players.get(clientId),
  })

  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message.toString());
    switch (parsedMessage.type) {
        case 'user-move': 
            broadcast({
                type: "player-movement",
                payload: {
                    id: clientId,
                    x: parsedMessage.payload.x,
                    y: parsedMessage.payload.y,
                    velocity: {
                        vx: parsedMessage.payload.velocity.vx,
                        vy: parsedMessage.payload.velocity.vy
                    }
                }
            })
    }
  });

  function broadcast(message : message) {
        wss.clients.forEach((client) => {
            if(client.readyState === WebSocket.OPEN && client != ws) {
                client.send(JSON.stringify(message));
            }
        })
    }

    ws.on("close", () => {
        const id = clientId;
        players.delete(clientId);
        // console.log(players.values.toString());
        broadcast({
            type: "player-left",
            payload: {
                players : [...players],
                id
            }
        })
    })
});