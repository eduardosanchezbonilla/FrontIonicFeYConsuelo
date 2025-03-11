import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MenuMusicianPageRoutingModule } from './menu-musician-routing.module';
import { MenuMusicianPage } from './menu-musician.page';
import { NgxsModule } from '@ngxs/store';
import { MusicianState } from '../state/musician/musician.state';
import { MusicianService } from '../services/musician/musician.service';
import { ModalMusicianComponent } from './components/modal-musician/modal-musician.component';
import { VoiceService } from '../services/voice/voice.service';
import { VoiceState } from '../state/voice/voice.state';
import { ModalVoiceComponent } from './components/modal-voice/modal-voice.component';
import { ModalPartitureComponent } from './components/modal-partiture/modal-partiture.component';
import { UserPartitureGroupService } from '../services/user-partiture-group/user-partiture-group.service';
import { UserPartitureGroupState } from '../state/user-partiture-group/user-partiture-group.state';
import { ModalMusicianInventoryComponent } from './components/modal-inventory/modal-musician-inventory.component';
import { MusicianInventoryState } from '../state/musician-inventory/musician-inventory.state';
import { MusicianInventoryService } from '../services/musician-inventory/musician-inventory.service';
import { ModalMusicianEventComponent } from './components/modal-event/modal-musician-event.component';
import { MusicianEventService } from '../services/musician-event/musician-event.service';
import { MusicianEventState } from '../state/musicien-event/musician-event.state';
import { CalendarModule } from 'ion2-calendar';
import { EventState } from '../state/event/event.state';
import { EventService } from '../services/event/event.service';
import { CameraService } from '../services/camera/camera.service';
import { ModalMusicianMarchSoloComponent } from './components/modal-musician-march-solo/modal-musician-march-solo.component';
import { MusicianMarchSoloState } from '../state/musician-march-solo/musician-march-solo.state';
import { MusicianMarchSoloService } from '../services/musician-march-solo/musician-march-solo.service';
import { ModalMusicianSolosStatsComponent } from './components/modal-musician-solos-stats/modal-musician-solos-stats.component';
import { MusicianSolosStatsState } from '../state/musician-solos-stats/musician-solos-stats.state';
import { MusicianSolosStatsService } from '../services/musician-solos-stats/musician-solos-stats.service';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MenuMusicianPageRoutingModule,
    CalendarModule,
    NgxsModule.forFeature([MusicianState]),
    NgxsModule.forFeature([VoiceState]),
    NgxsModule.forFeature([UserPartitureGroupState]),
    NgxsModule.forFeature([MusicianInventoryState]),
    NgxsModule.forFeature([MusicianEventState]),
    NgxsModule.forFeature([MusicianMarchSoloState]),
    NgxsModule.forFeature([MusicianSolosStatsState]),
    NgxsModule.forFeature([EventState]),
    NgChartsModule
  ],  
  declarations: [
    MenuMusicianPage,
    ModalMusicianComponent,
    ModalVoiceComponent,
    ModalPartitureComponent,
    ModalMusicianInventoryComponent,
    ModalMusicianEventComponent,
    ModalMusicianMarchSoloComponent,
    ModalMusicianSolosStatsComponent
  ],
  providers:[
    MusicianService,
    VoiceService,
    UserPartitureGroupService,
    MusicianInventoryService,
    MusicianEventService,
    EventService,
    CameraService,
    MusicianMarchSoloService,
    MusicianSolosStatsService
  ]
})
export class MenuMusicianPageModule {}
