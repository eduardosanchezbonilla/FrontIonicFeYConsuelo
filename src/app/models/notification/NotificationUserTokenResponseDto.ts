
export class NotificationUserTokenResponseDto {
    username: string;
    name: string;    
    email: string;    
    tokens: string[];

    constructor(username: string, 
                name:string,
                email:string,                
                tokens: string[]
    ) {        
        this.name = name;
        this.email = email;
        this.username = username;
        this.tokens = tokens;
    }
    
}
