import { RepertoireMarchSoloist } from "../repertoire-march-soloist/repertoire-march-soloist";
import { Voice } from "../voice/voice";

export class RepertoireMarchSolo {
    id?: number;
    name: string;  
    order: number;            
    mainSoloists: RepertoireMarchSoloist[];
    secondarySoloists: RepertoireMarchSoloist[];   
}
