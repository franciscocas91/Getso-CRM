// src/services/appEvents.ts
type EventCallback = (data: any) => void;

class EventEmitter {
    private events: Record<string, EventCallback[]> = {};

    on(eventName: string, callback: EventCallback): () => void {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);

        // Return an unsubscribe function
        return () => {
            if (this.events[eventName]) {
                this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
            }
        };
    }

    emit(eventName: string, data?: any): void {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(data));
        }
    }
}

export const appEvents = new EventEmitter();
