import { LatLng } from "../route-event/latLng";
import { RouteEvent } from "../route-event/route-event";
import { Voice } from "../voice/voice";

export class Event {
    id?: number;
    type: string;  // REHEARSAL, PERFORMANCE    
    title: string;
    description: string;
    performanceType: string;  // concierto, desfile procesional
    date: string;
    startTime: string;
    endTime: string;        
    voiceList: Voice[];
    voiceIdList: number[];
    repetitionPeriod: string;
    endDate?: string;
    location: string;
    municipality: string;
    province: string;    
    clsClass: string;
    image?: string;
    musicianBus?: boolean;
    musicianAssist?: boolean;
    displacementBus?: boolean;
    route: RouteEvent;
    currentPosition: LatLng;
    currentMarch: string;
    eventPublic?: boolean;
    repertoirePublic?: boolean;
    crossheadPublic?: boolean;
    busData?: boolean;
    busTime?: string;
    busLocation?: string;
    duration?:number;
    kilometers?:number;
    googleId?: string;

    constructor(
        id: number, 
        type: string,
        title: string, 
        description: string,
        performanceType: string, 
        date: string, 
        startTime: string, 
        endTime: string, 
        voiceList: Voice[], 
        repetitionPeriod: string, 
        endDate: string, 
        location: string, 
        municipality: string, 
        province: string,
        clsClass: string,
        image?: string,
        musicianBus?: boolean,
        musicianAssist?: boolean,
        displacementBus?: boolean,
        eventPublic?: boolean,
        repertoirePublic?: boolean,
        crossheadPublic?: boolean,  
        busData?: boolean,
        busTime?: string,
        busLocation?: string,
        duration?:number,
        kilometers?:number,
        googleId?: string,
    ){
        this.id = id;
        this.type = type;
        this.title = title;
        this.description = description;
        this.performanceType = performanceType;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.voiceList = voiceList;
        this.repetitionPeriod = repetitionPeriod;
        this.endDate = endDate;
        this.location = location;
        this.municipality = municipality;
        this.province = province;
        this.clsClass = clsClass;
        this.image = image;
        this.musicianBus = musicianBus;
        this.musicianAssist = musicianAssist;
        this.displacementBus = displacementBus;
        this.eventPublic = eventPublic;
        this.repertoirePublic = repertoirePublic;
        this.crossheadPublic = crossheadPublic;
        this.busData = busData;
        this.busTime = busTime;
        this.busLocation = busLocation;
        this.duration = duration;
        this.kilometers = kilometers;
        this.googleId = googleId;

    }
}
