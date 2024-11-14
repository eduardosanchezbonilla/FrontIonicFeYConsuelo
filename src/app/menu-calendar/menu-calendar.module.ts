import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuCalendarPageRoutingModule } from './menu-calendar-routing.module';

import { MenuCalendarPage } from './menu-calendar.page';
import { CalendarModule } from 'ion2-calendar';

import {  CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuCalendarPageRoutingModule,
    CalendarModule
  ],
  declarations: [MenuCalendarPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class MenuCalendarPageModule {}
