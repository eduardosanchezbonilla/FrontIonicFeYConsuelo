import { Contract } from "../contract/contract";

export class ContractGroup {
    id?: number;
    name: string;
    googleId?: string;    
    contracts?: Contract[];

    constructor(name?: string) {        
        this.name = name;        
    }
}