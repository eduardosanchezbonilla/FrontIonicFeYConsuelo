import { MusicianGroupByVoice } from "../musician/musician-group-by-voice";
import { RepertoireMarchGroupByType } from "../repertoire/repertoire-march-group-by-type";
import { Event } from "./event";

export class EventRepertoire {
    event: Event;
    repertoireMarchGroupByType: RepertoireMarchGroupByType[];
}
