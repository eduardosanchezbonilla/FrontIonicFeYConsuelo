
export class ContactResponse {
    id: number;
    name: string;
    phoneNumber: string;
    email: string;
    message: string;    
    readed: boolean;
    createdTime: string;

    constructor(id: number,
                name: string, 
                phoneNumber: string,
                email: string,
                message: string,
                readed: boolean,
                createdTime: string
    ) {
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.message = message;
        this.readed = readed;        
        this.createdTime = createdTime;
    }
}