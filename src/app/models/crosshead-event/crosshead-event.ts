import { CrossheadStreetEvent } from "./crosshead-street-event";

export class CrossheadEvent {
    streets: CrossheadStreetEvent[];
    
    constructor(streets: CrossheadStreetEvent[]) {
        this.streets = streets;
    }
}