import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { ModalViewCategoryImageComponent } from './component/modal-view-category-image/modal-view-category-image.component';
import { CameraService } from '../services/camera/camera.service';
import { ModalViewCategoryVideosComponent } from './component/modal-view-category-videos/modal-view-category-videos.component';

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
    ModalVideoCategoryComponent,
    ModalViewCategoryImageComponent,
    ModalViewCategoryVideosComponent
  ],
  providers:[
    VideoCategoryService,
    VideoService,
    CameraService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MenuMultimediaPageModule {}
