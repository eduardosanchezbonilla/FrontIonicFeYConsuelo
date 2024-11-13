import { VideoCategory } from "../video-category/video-category";

export class Video {
    id?: number;
    youtubeId: string;
    videoCategory: VideoCategory;    
    videoCategoryId: number;  
    name: string;    
    description: string;
    order: number;
     
    constructor(name?: string) {        
        this.name = name;        
    }
}
