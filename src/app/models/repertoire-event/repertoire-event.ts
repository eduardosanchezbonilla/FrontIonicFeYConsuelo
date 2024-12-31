
export class RepertoireEvent {
    marchId: number;
    eventType: string;
    eventId: number;
    checked: boolean;
    
    constructor(marchId?:number,
                eventType?: string,
                eventId?: number,
                checked?: boolean
    ) {
        this.marchId = marchId;
        this.eventType = eventType;
        this.eventId = eventId;
        this.checked = checked;        
    }
}