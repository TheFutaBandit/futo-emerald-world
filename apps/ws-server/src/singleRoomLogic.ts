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

            switch(parsedData.type) {
                case("join") : 
                    break;
                case('move') : 
                    break;
            }
        })
    }

    send(payload : OutgoingMesasge ) {
        console.log("I have received the message in the Send here, I am now sending it back to the clinet");
        this.ws.send(JSON.stringify(payload));
    }

    destroy() {
        this.ws.close();
    }
}