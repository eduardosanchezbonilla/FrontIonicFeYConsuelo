import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { Tab2PageRoutingModule } from './tab2-routing.module';
import { CategoriesService } from './services/categories.service';
import { NgxsModule } from '@ngxs/store';
import { CategoriesState } from './state/categories.state';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab2PageRoutingModule,
    NgxsModule.forFeature([
      CategoriesState
    ])
  ],
  declarations: [Tab2Page],
  providers:[CategoriesService]
})
export class Tab2PageModule {}
