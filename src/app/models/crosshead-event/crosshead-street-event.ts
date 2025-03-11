import { CrossheadMarchEvent } from "./crosshead-march-event";

export class CrossheadStreetEvent {
    id: number;
    street: string;
    streetOrder: number;
    annotations: string;
    annotationsView: string;
    isAnnotations: boolean;
    marchs: CrossheadMarchEvent[];
    
    constructor(id: number,
                street: string,
                streetOrder: number,
                annotations: string,
                annotationsView: string,
                isAnnotations: boolean,
                marchs: CrossheadMarchEvent[]
    ) {
        this.id = id;
        this.street = street;
        this.streetOrder = streetOrder;
        this.annotations = annotations;
        this.annotationsView = annotationsView;
        this.isAnnotations = isAnnotations;
        this.marchs = marchs;
    }
}