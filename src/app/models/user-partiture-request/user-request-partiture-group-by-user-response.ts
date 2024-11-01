import { UserDetail } from "../user/user-detail";
import { UserRequestPartitureResponse } from "./user-request-partiture-response";

export class UserRequestPartitureGroupByUserResponse {
    user: UserDetail
    request: UserRequestPartitureResponse[]; 

}