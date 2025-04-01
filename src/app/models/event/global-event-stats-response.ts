import { EventDetailStatsResponse } from "./event-detail-stats-response";
import { EventMarchStatsResponse } from "./event-march-stats-response";
import { EventStatResponse } from "./event-stats-response";

export class GlobalEventStatsResponse {
    totalStats:EventDetailStatsResponse;
    eventStats:EventStatResponse[];
}