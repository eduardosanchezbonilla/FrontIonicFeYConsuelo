import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { RepertoireMarch } from 'src/app/models/repertoire/repertoire-march';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-modal-view-repertoire-march-soloist',
  templateUrl: './modal-view-repertoire-march-soloist.component.html',
  styleUrls: ['./modal-view-repertoire-march-soloist.component.scss'],
})
export class ModalViewRepertoireMarchSoloistComponent implements OnInit {

  @Input() repertoireMarch: RepertoireMarch;
  
  public initScreen = false;  

  constructor(    
    private modalController: ModalController,
    private loadingService: LoadingService,        
  ) { }

  async ngOnInit() {            
    
  }

  async dismissInitialLoading(){
    if(this.initScreen){
      await this.loadingService.dismissLoading();         
    }
  }

  async ionViewDidEnter(){
    this.initScreen = true;    
    this.dismissInitialLoading();    
  }

  ngOnDestroy() {    
    this.doDestroy();
  }
  
  async ionViewDidLeave(){
    this.doDestroy();
  }

  private doDestroy(){
    console.log("ngOnDestroy musician");         
  }


  confirm(){
    this.modalController.dismiss(null, 'cancel');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

}
