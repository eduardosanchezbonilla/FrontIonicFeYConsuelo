
export class SurveyOption {
    id: number;
    name: string;
    description: string;
    youtubeId: string;
    order: number;
    
    constructor(id: number,
                name: string,
                description: string,
                youtubeId: string,
                order: number
    ) {
        this.id = id;
        this.name = name;        
        this.description = description;
        this.youtubeId = youtubeId;      
        this.order = order;  
    }
}