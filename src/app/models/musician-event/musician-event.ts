
export class MusicianEvent {
    musicianId: number;
    eventType: string;
    eventId: number;
    assist: boolean;
    bus: boolean;
    
    constructor(musicianId?:number,
                eventType?: string,
                eventId?: number,
                assist?: boolean,
                bus?: boolean,
    ) {
        this.musicianId = musicianId;
        this.eventType = eventType;
        this.eventId = eventId;
        this.assist = assist;
        this.bus = bus;
    }
}