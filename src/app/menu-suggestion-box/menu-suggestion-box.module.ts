import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { IonicModule } from '@ionic/angular';

import { MenuSuggestionBoxPageRoutingModule } from './menu-suggestion-box-routing.module';

import { MenuSuggestionBoxPage } from './menu-suggestion-box.page';
import { SuggestionBoxState } from '../state/suggestion-box/suggestion-box.state';
import { SuggestionBoxService } from '../services/suggestion-box/suggestion-box.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuSuggestionBoxPageRoutingModule,
    NgxsModule.forFeature([SuggestionBoxState]),
  ],
  declarations: [MenuSuggestionBoxPage],
  providers:[
      SuggestionBoxService
    ]
})
export class MenuSuggestionBoxPageModule {}
