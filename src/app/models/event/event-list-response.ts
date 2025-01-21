import { MusicianAssistInformationDetail } from "../musician-event/musician-assist-information-detail";
import { MusicianEventAssistStatisticsResponse } from "../musician-event/musician-event-assist-statistics-response";
import { Event } from "./event";
import { EventAssistStatisticsResponse } from "./event-assist-statistics-response";

export class EventListResponse {
    eventAssistStatistic: EventAssistStatisticsResponse;
    musicianEventAssistStatistic: MusicianEventAssistStatisticsResponse;
    musiciansAssistInformation: MusicianAssistInformationDetail[];
    events: Event[];
}