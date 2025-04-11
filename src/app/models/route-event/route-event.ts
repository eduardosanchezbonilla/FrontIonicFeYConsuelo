import { LatLng } from "./latLng";
import { PoiEvent } from "./poi-event";

export class RouteEvent {
    center: LatLng;
    zoomLevel: number;
    rotation: number;
    route: LatLng[];
    circles: LatLng[];
    kilometers: number;
    pois: PoiEvent[];
    
    constructor(center: LatLng,
                zoomLevel: number,
                route: LatLng[], 
                circles: LatLng[],
                rotation: number,
                kilometers: number,
                pois: PoiEvent[]
    ) {
        this.center = center;
        this.zoomLevel = zoomLevel;
        this.route = route;
        this.circles = circles;
        this.rotation = rotation;
        this.kilometers = kilometers;
        this.pois = pois;
    }
}