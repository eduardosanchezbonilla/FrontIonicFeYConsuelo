import { EventDetailStatsResponse } from "./event-detail-stats-response";
import { EventStatInfoResponse } from "./event-stat-info-response";

export class EventStatResponse {
    event:EventStatInfoResponse;
    stats:EventDetailStatsResponse;
}