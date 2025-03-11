import { LatLng } from "./latLng";

export class RouteEvent {
    center: LatLng;
    zoomLevel: number;
    rotation: number;
    route: LatLng[];
    circles: LatLng[];
    
    constructor(center: LatLng,
                zoomLevel: number,
                route: LatLng[], 
                circles: LatLng[],
                rotation: number 
    ) {
        this.center = center;
        this.zoomLevel = zoomLevel;
        this.route = route;
        this.circles = circles;
        this.rotation = rotation;
    }
}