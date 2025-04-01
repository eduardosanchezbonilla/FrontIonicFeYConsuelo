
export class Contract {
    name?: string;
    googleId: string;    
    content: string;
    mimeType: string;
    folderGoogleId: string;

    constructor(name?: string, 
                googleId?:string,
                content?: string
    ) {        
        this.name = name;
        this.googleId = googleId;
        this.content = content;
    }
    
}
