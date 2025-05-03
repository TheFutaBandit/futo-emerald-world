import { OutgoingMesasge } from "./types/index.js";
import type { User } from "./User.js";

export class RoomManager {
    rooms: Map<string, User[]> = new Map();

    static instance : RoomManager;

    private constructor() {
        this.rooms = new Map();
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new RoomManager();
        }
        return this.instance;
    }   

    addUser(User : User, roomId : string) {
        if(!this.rooms.has(roomId)) {
            this.rooms.set(roomId, [User]);
            return;
        }
        this.rooms.set(roomId, [...(this.rooms.get(roomId)??[]), User])
    }

    removeUser(User: User, roomId : string) {
        this.rooms.set(roomId, ((this.rooms.get(roomId))?.filter((user) => user.userId != User.userId)) ?? []);
    }

    public broadcastMessage(message : OutgoingMesasge, roomId : string, User : User) {
        if(!this.rooms.has(roomId)) {
            return;
        }
        this.rooms.get(roomId)?.forEach((u) => {
            if(u.userId != User.userId) {
                u.send(message);
            }
        })
    }

}

