import { Musician } from "src/app/models/musician/musician";
import { UserDetail } from "./user-detail";
import { MusicianMarchSoloResponse } from "../musician-march-solo/musician-march-solo-response";

export class TokenUser {
    token: string;    
    username: string;
    roles:string[];
    musician: Musician;
    musicianMarchSolos: MusicianMarchSoloResponse[];
    userDetail: UserDetail;
}