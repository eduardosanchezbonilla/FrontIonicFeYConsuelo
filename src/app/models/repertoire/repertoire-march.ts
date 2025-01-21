import { RepertoireCategory } from "../repertoire-category/repertoire-category";
import { RepertoireMarchType } from "../repertoire-march-type/repertoire-march-type";

export class RepertoireMarch {
    id?: number;
    categoryId: number;
    category: RepertoireCategory;
    typeId: number;
    type: RepertoireMarchType;
    name: string;  
    author: string;  
    description: string;        
    image: string;    
    youtubeId: string; 
    checked: boolean;   
    order: number;
    numbers: number;
}
