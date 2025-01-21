import { Voice } from "../voice/voice";

export class Musician {
    id?: number;
    dni: string;
    name: string;
    surname: string;
    birthDate: string;
    registrationDate: string;
    direction: string;
    municipality: string;
    province: string;
    email?: string;
    image?: string;
    voice: Voice;    
    voiceId: number;    
    inventoryObservations: string;  
    idLastRehearsal: number;
    assistLastRehearsal: boolean;
    assistBus: boolean;
    dateLastRehearsal: string;
    phoneNumber: string;
    
    constructor(name?: string) {        
        this.name = name;        
    }
}