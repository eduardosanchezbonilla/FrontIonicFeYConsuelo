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

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MenuMusicianPageRoutingModule,
    NgxsModule.forFeature([MusicianState]),
    NgxsModule.forFeature([VoiceState]),
    NgxsModule.forFeature([UserPartitureGroupState]),
    NgxsModule.forFeature([MusicianInventoryState])
  ],  
  declarations: [
    MenuMusicianPage,
    ModalMusicianComponent,
    ModalVoiceComponent,
    ModalPartitureComponent,
    ModalMusicianInventoryComponent
  ],
  providers:[
    MusicianService,
    VoiceService,
    UserPartitureGroupService,
    MusicianInventoryService
  ]
})
export class MenuMusicianPageModule {}
