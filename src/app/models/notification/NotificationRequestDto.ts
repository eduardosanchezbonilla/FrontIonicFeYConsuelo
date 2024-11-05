import { NotificationTopicResponseDto } from "./NotificationTopicResponseDto";
import { NotificationUserTokenResponseDto } from "./NotificationUserTokenResponseDto";

export class NotificationRequestDto {
    title: string;
    notification: string;    
    topics: string[];    
    tokens: string[];
    topicsObject: NotificationTopicResponseDto[];
    tokensObject: NotificationUserTokenResponseDto[];

    constructor(title: string, 
                notification:string,
                topics: string[],
                tokens: string[]
    ) {        
        this.title = title;
        this.notification = notification;
        this.topics = topics;
        this.tokens = tokens;
        this.topicsObject = [];
        this.tokensObject = [];
    }
    
}
