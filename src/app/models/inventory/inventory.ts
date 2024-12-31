import { Musician } from "../musician/musician";

export class Inventory {
    id?: number;
    order: number;
    name: string;
    image?: string;
    units: number;
    musicianWithElement: number;
    musicians?: Musician[];

}