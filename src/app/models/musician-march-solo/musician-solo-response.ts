
export class MusicianSoloResponse {
    soloName: string;
    soloOrder: number;
    
    constructor(soloName:string,
                soloOrder?: number
    ) {
        this.soloName = soloName;
        this.soloOrder = soloOrder;
    }
}