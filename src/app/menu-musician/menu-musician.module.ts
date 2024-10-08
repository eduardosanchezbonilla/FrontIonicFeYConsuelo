import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MenuMusicianPageRoutingModule } from './menu-musician-routing.module';
import { MenuMusicianPage } from './menu-musician.page';
import { NgxsModule } from '@ngxs/store';
import { MusicianState } from './state/musician/musician.state';
import { MusicianService } from './services/musician/musician.service';
import { ModalMusicianComponent } from './components/modal-musician/modal-musician.component';
import { VoiceService } from './services/voice/voice.service';
import { VoiceState } from './state/voice/voice.state';
import { ModalVoiceComponent } from './components/modal-voice/modal-voice.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MenuMusicianPageRoutingModule,
    NgxsModule.forFeature([MusicianState]),
    NgxsModule.forFeature([VoiceState])
  ],  
  declarations: [MenuMusicianPage,ModalMusicianComponent,ModalVoiceComponent/*, FilterItemsPipe*/],
  providers:[
    MusicianService,
    VoiceService
  ]
})
export class MenuMusicianPageModule {}
