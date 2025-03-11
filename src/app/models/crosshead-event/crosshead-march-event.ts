
export class CrossheadMarchEvent {
    id:number;
    marchId: number;
    marchName: string;
    marchOrder: number;
    annotations: string;
    
    constructor(id:number,
                marchId: number,
                marchName: string,
                marchOrder: number,
                annotations: string
    ) {
        this.id = id;
        this.marchId = marchId;
        this.marchName = marchName;
        this.marchOrder = marchOrder;
        this.annotations = annotations;
    }
}