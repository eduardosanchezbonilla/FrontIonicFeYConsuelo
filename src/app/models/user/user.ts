import { Musician } from "src/app/models/musician/musician";
import { UserDetail } from "./user-detail";
import { MusicianMarchSoloResponse } from "../musician-march-solo/musician-march-solo-response";

export class User {
    _id?: string;    
    username: string;
    password: string;
    roles: string[];
    profile: string;
    passwordExpired: boolean;
    musician: Musician;
    musicianMarchSolos: MusicianMarchSoloResponse[];
    userDetail: UserDetail;
    todayPerformance: number[];

    constructor(username: string, 
                roles:string[],
                profile: string,
                musician: Musician,
                musicianMarchSolos: MusicianMarchSoloResponse[],
                uerDetail: UserDetail,
                todayPerformance: number[],
                _id?: string
    ) {
        this.username = username;
        this.roles = roles;
        this.profile = profile;
        this.musician = musician;
        this.musicianMarchSolos = musicianMarchSolos;
        this.userDetail = uerDetail;
        this.todayPerformance = todayPerformance;
        this._id = _id;
    }
}