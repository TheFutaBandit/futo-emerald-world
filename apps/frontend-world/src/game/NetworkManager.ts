export class NetworkManager {
    private static instance: NetworkManager;
    public socket: WebSocket | null;
    public userId: string | null;
    public isConnected: boolean;
    private reconnectAttempts: number;
    private maxReconnectAttempts: number;

    private messageHandlers: Map<string, Function[]>;

    private messageQueue: {type: string, payload: any}[] = [];
    private handlersRegistered: boolean = false;

    private constructor() {
        this.socket = null;
        this.userId = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.messageHandlers = new Map<string, Function[]>();
    }
    public static getInstance(): NetworkManager {
        if (!NetworkManager.instance) {
            NetworkManager.instance = new NetworkManager();
        }
        return NetworkManager.instance;
    }

    public connect(): void {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            console.log("WebSocket already connected or connecting");
            return;
        }

        console.log("Connecting to WebSocket server...");
        this.socket = new WebSocket("wss://143.110.188.87/ws");

        this.socket.onopen = () => {
            console.log("WebSocket connection established");
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.triggerEvent('connected', null);
        };

        this.socket.onclose = () => {
            console.log("WebSocket connection closed");
            this.isConnected = false;
            this.attemptReconnect();
            this.triggerEvent('disconnected', null);
        }

        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            this.isConnected = false;
            this.triggerEvent('error', error);
        };

        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log("Received message:", message);
                this.handleMessage(message);
            } catch (error) {
                console.error("Error parsing message:", error);
            }
        }
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error("Max reconnect attempts reached. Not trying again.");
            return;
        }
        console.log(`Attempting to reconnect... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        this.reconnectAttempts++;
        setTimeout(() => {
            this.connect();
        }, 2000* Math.pow(2, this.reconnectAttempts - 1));
    }

    public sendMessage(type: string, payload: any): void {
        if(!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not open. Cannot send message.");
            return;
        }

        this.socket.send(JSON.stringify({
            type: type,
            payload: payload
        }))
    }

    public on(event : string, callback: Function) : void {
        console.log("Does the init feed me functions?");
        console.log(event);
        if(!this.messageHandlers.has(event)) {
            this.messageHandlers.set(event, []);
        }
        this.messageHandlers.get(event)?.push(callback);
        console.log(this.messageHandlers);  
    }

    public off(event: string, callback: Function): void {
        if(!this.messageHandlers.has(event)) return;

        const handlers = this.messageHandlers.get(event);
        const index = handlers?.indexOf(callback);
        if(index !== -1) {
            handlers?.splice(index!, 1);
        }
    }

    private handleMessage(msg: any): void {
        console.log("I am handle but modified now");
        if (!this.handlersRegistered) {
            // Queue the message for later processing
            this.messageQueue.push({type: msg.type, payload: msg.payload});
            console.log(`Queued message of type: ${msg.type} (handlers not yet registered)`);
            return;
        }
        
        // Process as normal
        this.triggerEvent(msg.type, msg.payload);
    }

    public markHandlersRegistered(): void {
        this.handlersRegistered = true;
        console.log(`Processing ${this.messageQueue.length} queued messages`);
        
        // Process any queued messages
        while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift()!;
            this.triggerEvent(msg.type, msg.payload);
        }
    }

    private triggerEvent(event: string, data: any): void {
        console.log("Does the control reach trigger event?");
        console.log(`Event: ${event}`);
        console.log(this.messageHandlers)
        if (!this.messageHandlers.has(event)) return;
        console.log(`does the event get triggered? ${event}`);

        for (const handler of this.messageHandlers.get(event)!) {
            console.log(`Triggering event: ${event}`);
            handler(data);
        }
    }

    public disconnect(): void {
        if(this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.isConnected = false;
        this.userId = null;
    }
}