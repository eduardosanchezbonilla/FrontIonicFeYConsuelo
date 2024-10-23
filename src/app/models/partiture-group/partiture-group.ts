import { Partiture } from "../partiture/partiture";

export class PartitureGroup {
    id?: number;
    name: string;
    googleId?: string;    
    partitures?: Partiture[];

    constructor(name?: string) {        
        this.name = name;        
    }
}