
export class ContactRequest {
    id: number;
    name: string;
    phoneNumber: string;
    email: string;
    message: string;    
    readed: boolean;
    
    constructor(id: number,
        name: string, 
        phoneNumber: string,
        email: string,
        message: string,
        readed?: boolean
    ) {
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.message = message;
        this.readed = readed;        
    }
}