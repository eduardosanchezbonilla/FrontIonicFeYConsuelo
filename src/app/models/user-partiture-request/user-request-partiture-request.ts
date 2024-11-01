
export class UserRequestPartitureRequest {
    id: number;
    username: string;    
    description: string;
    readed: boolean;
    markReadUnreadNotificationMessage: string;

    constructor(id?: number,
                username?:string,                
                description?: string,
                readed?: boolean,
                markReadUnreadNotificationMessage?: string
    ) {
        this.id = id;
        this.username = username;        
        this.description = description;
        this.readed = readed;
        this.markReadUnreadNotificationMessage = markReadUnreadNotificationMessage
    }
}