import { LatLng } from "./latLng";


export class PoiEvent {
    id: string;
    center: LatLng;
    type: 'iglesia' | 'tribuna';
    
    constructor(id: string, 
                center: LatLng,
                type: string
    ) {
        this.center = center;
        this.id = id;
        this.type = type as 'iglesia' | 'tribuna';
    }
}