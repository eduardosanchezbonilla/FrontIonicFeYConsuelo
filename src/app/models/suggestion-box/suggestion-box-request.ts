
export class SuggestionBoxRequest {
    id: number;
    suggestion: string;
    readed: boolean;
    
    constructor(id?: number,
                suggestion?: string,
                readed?: boolean
    ) {
        this.id = id;        
        this.suggestion = suggestion;
        this.readed = readed;        
    }
}