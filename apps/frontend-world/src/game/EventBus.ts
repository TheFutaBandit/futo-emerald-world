// In EventBus.ts
import { Events } from 'phaser';

// Modified EventBus with storage capability
class EnhancedEventBus extends Events.EventEmitter {
    private storage: Map<string, any> = new Map();
    
    // Store data that can be requested later
    storeData(key: string, data: any) {
        this.storage.set(key, data);
    }
    
    // Get stored data
    getData(key: string) {
        return this.storage.get(key);
    }
    
    // Check if data exists
    hasData(key: string) {
        return this.storage.has(key);
    }
}

// Used to emit events between components, HTML and Phaser scenes
export const EventBus = new EnhancedEventBus();