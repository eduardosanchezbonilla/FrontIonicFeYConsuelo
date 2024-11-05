
export class NotificationTopicResponseDto {
    topic: string;
    topicName: string;    
    
    constructor(topic: string, 
                topicName:string
    ) {        
        this.topic = topic;
        this.topicName = topicName;        
    }
    
}
