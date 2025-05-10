import { SurveyOption } from "./survey-option-dto";
import { SurveyOptionVote } from "./survey-option-vote-dto";

export class SurveyVote {
    id: number;
    options: SurveyOptionVote[];
    
    constructor(id: number,
                options: SurveyOptionVote[]
    ) {
        this.id = id;        
        this.options = options;  
    }
}