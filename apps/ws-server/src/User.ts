import random from "random-string-generator";
import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager.js";
import { prisma } from "@repo/db"
import { OutgoingMesasge } from "./types/index.js";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from "./config.js";

export class User {
    public userId: string;
    private roomId?: string;
    private x : number;
    private y : number;

    constructor(private ws: WebSocket) {
        this.userId = random(10);
        this.x = 0;
        this.y = 0;
        this.initHandler();
    }

    initHandler() {
        this.ws.on("message", async (event) => {
            const data = event.toString()
            const parsedData = JSON.parse(data);
            if(!parsedData) {
                return;
            }

            const RoomManagerInstance = RoomManager.getInstance();

            switch(parsedData.type) {
                case("join") : 
                    const roomId = parsedData.payload.roomId;
                    const token = parsedData.payload.token;

                    const receivedId = (jwt.verify(token, JWT_SECRET) as JwtPayload).userId;

                    if(!receivedId) {
                        this.ws.close()
                        return;
                    }


                    this.userId = receivedId;
                    this.roomId = roomId;

                    RoomManagerInstance.addUser(this, roomId);

                    this.send({
                        type: "space-joined",
                        payload: {
                            spawn: {
                                x : this.x,
                                y : this.y
                            }
                        },
                        users: RoomManagerInstance.rooms.get(roomId)?.map((u) => ({
                            id : u.userId
                        }))
                    })

                    RoomManagerInstance.broadcastMessage(({
                        type: "user-join",
                        payload: {
                            userId: this.userId,
                            x: this.x,
                            y: this.y,
                        }
                    }), this.roomId!, this);

                    break;
                case('move'):
                    const payload = parsedData.payload;

                    if(!payload || !this.roomId) {
                        return;
                    }
                    break;
            }
        })
    }

    send(payload : OutgoingMesasge ) {
        console.log("I have received the message in the Send here, I am now sending it back to the clinet");
        this.ws.send(JSON.stringify(payload));
    }
}