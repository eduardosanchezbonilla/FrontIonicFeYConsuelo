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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuEventPageRoutingModule,
    CalendarModule,
    NgxsModule.forFeature([EventState, MusicianEventState]),
  ],
  declarations: [MenuEventPage, ModalEditEventComponent],
  providers:[
    EventService,
    MusicianEventService    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class MenuEventPageModule {}