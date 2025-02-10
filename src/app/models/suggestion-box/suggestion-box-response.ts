
export class SuggestionBoxResponse {
    id: number;
    username: string;    
    suggestion: string;
    readed: boolean;

    constructor(id?: number,
                username?:string,                
                suggestion?: string,
                readed?: boolean
    ) {
        this.id = id;
        this.username = username;        
        this.suggestion = suggestion;
        this.readed = readed;
    }
}