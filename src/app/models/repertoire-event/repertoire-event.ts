
export class RepertoireEvent {
    marchId: number;
    eventType: string;
    eventId: number;
    checked: boolean;
    order: number;
    nubmers: number;
    
    constructor(marchId?:number,
                eventType?: string,
                eventId?: number,
                checked?: boolean,
                order?: number,
                nubmers?: number
    ) {
        this.marchId = marchId;
        this.eventType = eventType;
        this.eventId = eventId;
        this.checked = checked;        
        this.order = order;
        this.nubmers = nubmers;
    }
}