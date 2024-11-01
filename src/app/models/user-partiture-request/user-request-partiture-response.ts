
export class UserRequestPartitureResponse {
    id: number;
    username: string;    
    description: string;
    readed: boolean;

    constructor(id?: number,
                username?:string,                
                description?: string,
                readed?: boolean
    ) {
        this.id = id;
        this.username = username;        
        this.description = description;
        this.readed = readed;
    }
}