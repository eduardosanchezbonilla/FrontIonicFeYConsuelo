import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuSoloPageRoutingModule } from './menu-solo-routing.module';

import { MenuSoloPage } from './menu-solo.page';
import { NgxsModule } from '@ngxs/store';
import { MusicianMarchSoloState } from '../state/musician-march-solo/musician-march-solo.state';
import { MusicianService } from '../services/musician/musician.service';
import { MusicianMarchSoloService } from '../services/musician-march-solo/musician-march-solo.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuSoloPageRoutingModule,
    NgxsModule.forFeature([MusicianMarchSoloState]),
  ],
  declarations: [MenuSoloPage],
  providers:[
    MusicianService,
    MusicianMarchSoloService
  ]
})
export class MenuSoloPageModule {}
