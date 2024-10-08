import { Category } from "src/app/tab2/models/category";
import { Musician } from "./musician";
import { Voice } from "../voice/voice";

export class MusicianGroupByVoice {    
    voice: Voice;    
    musicians: Musician[];
}