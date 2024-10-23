
export class MusicianInventory {
    musicianId: number;
    id: number;
    name: string;
    image: string;
    assigned: boolean;

    constructor(musicianId?:number,
                id?: number,
                name?: string,
                image?: string,
                assigned?: boolean
    ) {
        this.musicianId = musicianId;
        this.id = id;
        this.name = name;
        this.image = image;
        this.assigned = assigned;
    }
}