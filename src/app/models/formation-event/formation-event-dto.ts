import { Musician } from "../musician/musician";

export class Formation {
    rows: Row[];
}

export class Row {
    id: number; 
    musicians: MusicianSlot[];
}

export class MusicianSlot {
    id: number; 
    musician: Musician;
}