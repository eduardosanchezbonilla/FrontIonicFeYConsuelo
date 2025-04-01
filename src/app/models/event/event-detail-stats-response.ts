import { EventMarchStatsResponse } from "./event-march-stats-response";
import { EventMarchTypeStatsResponse } from "./event-march-type-stats-response";

export class EventDetailStatsResponse {
    marchsStats: EventMarchStatsResponse[];
    marchsTypeStats: EventMarchTypeStatsResponse[];
    mostPlayerMarchOwnSlow: EventMarchStatsResponse[];
    mostPlayerMarchOtherSlow: EventMarchStatsResponse[];
    leastPlayerMarchOwnSlow: EventMarchStatsResponse[];
    leastPlayerMarchOtherSlow: EventMarchStatsResponse[];
    countMostPlayerMarch: number;
    totalNumberMarchs:number;
    totalNumberMarchsOwnSlow:number;
    totalNumberMarchsOtherSlow:number;
    totalNumberMarchsOrdinary:number;
    totalNumberHours:number;
    totalNumberKilometers:number;
    averageNumberMarchsByHour:number;
    percentageNumberMarchsOwn:number;
    percentageNumberMarchsOther:number;          
}