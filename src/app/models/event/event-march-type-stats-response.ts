import { Event } from "./event";
import { EventMarchStatsResponse } from "./event-march-stats-response";

export class EventMarchTypeStatsResponse {
    name: string;
    image: string;
    count: number;   
    mostPlayerMarch: EventMarchStatsResponse[];
    leastPlayerMarch: EventMarchStatsResponse[];
}