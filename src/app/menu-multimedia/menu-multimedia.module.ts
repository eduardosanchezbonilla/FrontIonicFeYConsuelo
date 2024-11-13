import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuMultimediaPageRoutingModule } from './menu-multimedia-routing.module';

import { MenuMultimediaPage } from './menu-multimedia.page';
import { NgxsModule } from '@ngxs/store';
import { VideoCategoryState } from '../state/video-category/video-category.state';
import { VideoState } from '../state/video/video.state';
import { VideoCategoryService } from '../services/video-category/video-category.service';
import { VideoService } from '../services/video/video.service';
import { ModalViewVideoComponent } from './component/modal-view-video/modal-view-video.component';
import { ModalVideoComponent } from './component/modal-video/modal-video.component';
import { ModalVideoCategoryComponent } from './component/modal-video-category/modal-video-category.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuMultimediaPageRoutingModule,
    NgxsModule.forFeature([VideoCategoryState]),
    NgxsModule.forFeature([VideoState])
  ],
  declarations: [
    MenuMultimediaPage, 
    ModalViewVideoComponent,
    ModalVideoComponent,
    ModalVideoCategoryComponent
  ],
  providers:[
    VideoCategoryService,
    VideoService
  ]
})
export class MenuMultimediaPageModule {}
