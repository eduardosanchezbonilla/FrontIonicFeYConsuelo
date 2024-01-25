import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { Tab1PageRoutingModule } from './tab1-routing.module';
import { ItemsService } from './services/items.service';
import { NgxsModule } from '@ngxs/store';
import { ItemsState } from './state/items.state';
import { ModalItemComponent } from './components/modal-item.component';
import { FilterItemsPipe } from './pipes/filter-items.pipe';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab1PageRoutingModule,NgxsModule.forFeature([ItemsState])
  ],
  declarations: [Tab1Page,ModalItemComponent, FilterItemsPipe],
  providers:[
    ItemsService
  ]
})
export class Tab1PageModule {}
