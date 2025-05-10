import { SurveyOption } from "./survey-option-dto";
import { SurveyOptionVote } from "./survey-option-vote-dto";

export class Survey {
    id: number;
    name: string;
    type: string;
    description: string;
    question: string;
    isPublic: boolean;
    isOpen: boolean;
    isFinished: boolean;
    image: string;
    createdTime: string;
    options: SurveyOption[];    
    numberUsersVote: number;
    userOptionsVote: SurveyOptionVote[];
    
    constructor(id: number,
                name: string,
                type: string,
                description: string,
                question: string,
                isPublic: boolean,
                isOpen: boolean,
                isFinished: boolean,
                image: string,
                createdTime: string,
                options: SurveyOption[],
                numberUsersVote: number
    ) {
        this.id = id;        
        this.name = name;
        this.type = type;
        this.description = description;
        this.question = question;
        this.isPublic = isPublic;   
        this.isOpen = isOpen;
        this.isFinished = isFinished;   
        this.image = image;
        this.createdTime = createdTime;
        this.options = options;  
        this.numberUsersVote = numberUsersVote;
    }
}