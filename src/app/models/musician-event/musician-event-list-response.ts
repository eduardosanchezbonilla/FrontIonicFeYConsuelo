import { Event } from "../event/event";
import { MusicianEventAssistStatisticsResponse } from "./musician-event-assist-statistics-response";

export class MusicianEventListResponse {
    musicianEventAssistStatistic: MusicianEventAssistStatisticsResponse;
    events: Event[];
}