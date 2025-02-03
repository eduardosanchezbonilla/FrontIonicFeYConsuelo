import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuRepertoirePageRoutingModule } from './menu-repertoire-routing.module';

import { MenuRepertoirePage } from './menu-repertoire.page';
import { RepertoireCategoryState } from '../state/repertoire-category/repertoire-category.state';
import { NgxsModule } from '@ngxs/store';
import { RepertoireCategoryService } from '../services/repertoire-category/repertoire-category.service';
import { ModalRepertoireCategoryComponent } from './component/modal-repertoire-category/modal-repertoire-category.component';
import { RepertoireMarchTypeState } from '../state/repertoire-march-type/repertoire-march-type.state';
import { RepertoireMarchTypeService } from '../services/repertoire-march-type/repertoire-march-type.service';
import { ModalRepertoireMarchTypeComponent } from './component/modal-repertoire-march-type/modal-repertoire-march-type.component';
import { ModalEditRepertoireMarchTypeComponent } from './component/modal-edit-repertoire-march-type/modal-edit-repertoire-march-type.component';
import { ModalEditRepertoireMarchComponent } from './component/modal-edit-repertoire-march/modal-edit-repertoire-march.component';
import { ModalRepertoireMarchComponent } from './component/modal-repertoire-march/modal-repertoire-march.component';
import { RepertoireMarchState } from '../state/repertoire/repertoire-march.state';
import { RepertoireMarchService } from '../services/repertoire/repertoire-march.service';
import { CameraService } from '../services/camera/camera.service';
import { ModalEditRepertoireMarchSoloistComponent } from './component/modal-edit-repertoire-march-soloist/modal-edit-repertoire-march-soloist.component';
import { VoiceService } from '../services/voice/voice.service';
import { MusicianService } from '../services/musician/musician.service';
import { VoiceState } from '../state/voice/voice.state';
import { MusicianState } from '../state/musician/musician.state';
import { ModalViewRepertoireMarchSoloistComponent } from './component/modal-view-repertoire-march-soloist/modal-view-repertoire-march-soloist.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuRepertoirePageRoutingModule,
    NgxsModule.forFeature([RepertoireCategoryState]),
    NgxsModule.forFeature([RepertoireMarchTypeState]),    
    NgxsModule.forFeature([RepertoireMarchState]),    
    NgxsModule.forFeature([VoiceState]),    
    NgxsModule.forFeature([MusicianState]),    
  ],
  declarations: [
    MenuRepertoirePage,
    ModalRepertoireCategoryComponent,
    ModalRepertoireMarchTypeComponent,
    ModalRepertoireMarchComponent,
    ModalEditRepertoireMarchTypeComponent,
    ModalEditRepertoireMarchComponent,
    ModalEditRepertoireMarchSoloistComponent,
    ModalViewRepertoireMarchSoloistComponent,
  ],
  providers:[
    VoiceService,
    MusicianService,
    RepertoireCategoryService,
    RepertoireMarchTypeService,
    RepertoireMarchService,
    CameraService
  ]
})
export class MenuRepertoirePageModule {}
