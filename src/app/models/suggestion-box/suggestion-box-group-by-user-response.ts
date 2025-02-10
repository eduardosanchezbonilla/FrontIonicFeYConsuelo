import { UserDetail } from "../user/user-detail";
import { SuggestionBoxResponse } from "./suggestion-box-response";

export class SuggestionBoxGroupByUserResponse {
    user: UserDetail
    suggestions: SuggestionBoxResponse[]; 

}