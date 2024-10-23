
export class Partiture {
    name?: string;
    googleId: string;    
    content: string;

    constructor(name?: string, 
                googleId?:string,
                content?: string
    ) {        
        this.name = name;
        this.googleId = googleId;
        this.content = content;
    }
    
}
