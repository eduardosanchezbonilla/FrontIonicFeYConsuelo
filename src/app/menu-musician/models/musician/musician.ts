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
    province: number;
    email?: string;
    image?: string;
    voice: Voice;    
    voiceId: number;    
}