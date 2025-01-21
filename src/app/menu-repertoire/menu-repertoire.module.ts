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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuRepertoirePageRoutingModule,
    NgxsModule.forFeature([RepertoireCategoryState]),
    NgxsModule.forFeature([RepertoireMarchTypeState]),    
    NgxsModule.forFeature([RepertoireMarchState]),    
  ],
  declarations: [
    MenuRepertoirePage,
    ModalRepertoireCategoryComponent,
    ModalRepertoireMarchTypeComponent,
    ModalRepertoireMarchComponent,
    ModalEditRepertoireMarchTypeComponent,
    ModalEditRepertoireMarchComponent
  ],
  providers:[
    RepertoireCategoryService,
    RepertoireMarchTypeService,
    RepertoireMarchService,
    CameraService
  ]
})
export class MenuRepertoirePageModule {}
