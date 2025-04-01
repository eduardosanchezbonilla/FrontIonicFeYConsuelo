import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuEventPageRoutingModule } from './menu-event-routing.module';

import { CalendarModule } from 'ion2-calendar';

import {  CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalEditEventComponent } from './component/modal-edit-event/modal-edit-event.component';
import { NgxsModule } from '@ngxs/store';
import { EventState } from '../state/event/event.state';
import { EventService } from '../services/event/event.service';
import { MenuEventPage } from './menu-event.page';
import { MusicianEventService } from '../services/musician-event/musician-event.service';
import { MusicianEventState } from '../state/musicien-event/musician-event.state';
import { ModalMusicianAssistanceComponent } from './component/modal-musician-assistance/modal-musician-assistance.component';
import { ModalRepertoireEventComponent } from './component/modal-repertoire-event/modal-repertoire-event.component';
import { RepertoireMarchState } from '../state/repertoire/repertoire-march.state';
import { RepertoireMarchService } from '../services/repertoire/repertoire-march.service';
import { RepertoireEventState } from '../state/repertoire-event/repertoire-event.state';
import { RepertoireEventService } from '../services/repertoire-event/repertoire-event.service';
import { CameraService } from '../services/camera/camera.service';
import { ModalFormationEventComponent } from './component/modal-formation-event/modal-formation-event.component';
import { MusicianService } from '../services/musician/musician.service';
import { MusicianState } from '../state/musician/musician.state';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MusicianSelectorComponent } from './component/modal-formation-event/musician-selector.component';
import { ModalStatsComponent } from './component/modal-stats/modal-stats.component';
import { ModalRouteEventComponent } from './component/modal-route-event/modal-route-event.component';
import { HttpClientModule } from '@angular/common/http';
import { ModalCrossheadEventComponent } from './component/modal-crosshead-event/modal-crosshead-event.component';
import { MarchSelectorComponent } from './component/modal-crosshead-event/march-selector.component';
import { ModalStatsMarchsComponent } from './component/modal-stats-marchs/modal-stats-marchs.component';
import { NgChartsModule } from 'ng2-charts';
import { ModalAttachEventComponent } from './component/modal-attach-event/modal-attach-event.component';
import { CloudDocumentState } from '../state/cloud-document/cloud-document.state';
import { CloudDocumentService } from '../services/clouddocument/cloud-document.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuEventPageRoutingModule,
    CalendarModule,
    DragDropModule,
    NgxsModule.forFeature([EventState, MusicianEventState, RepertoireMarchState, RepertoireEventState,MusicianState,CloudDocumentState]),
    HttpClientModule,
    NgChartsModule
  ],
  declarations: [
    MenuEventPage, 
    ModalEditEventComponent,
    ModalMusicianAssistanceComponent,
    ModalRepertoireEventComponent,
    ModalFormationEventComponent,
    MusicianSelectorComponent,
    MarchSelectorComponent,
    ModalStatsComponent,
    ModalStatsMarchsComponent,
    ModalRouteEventComponent,
    ModalCrossheadEventComponent,
    ModalAttachEventComponent
  ],
  providers:[
    EventService,
    MusicianEventService,
    RepertoireMarchService,
    RepertoireEventService,
    CameraService,
    MusicianService,
    CloudDocumentService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class MenuEventPageModule {}
