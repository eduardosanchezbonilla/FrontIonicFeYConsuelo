import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuMultimediaPageRoutingModule } from './menu-multimedia-routing.module';

import { MenuMultimediaPage } from './menu-multimedia.page';
import { ModalMultimediaVideoComponent } from './component/modal-multimedia-video/modal-multimedia-video.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuMultimediaPageRoutingModule
  ],
  declarations: [MenuMultimediaPage, ModalMultimediaVideoComponent]
})
export class MenuMultimediaPageModule {}
