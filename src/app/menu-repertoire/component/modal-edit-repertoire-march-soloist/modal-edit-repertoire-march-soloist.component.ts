import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { MusicianSelectorComponent } from 'src/app/menu-event/component/modal-formation-event/musician-selector.component';
import { Musician } from 'src/app/models/musician/musician';
import { MusicianGroupByVoice } from 'src/app/models/musician/musician-group-by-voice';
import { RepertoireMarch } from 'src/app/models/repertoire/repertoire-march';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { GetMusiciansGroupByVoice, ResetMusician } from 'src/app/state/musician/musician.actions';
import { MusicianState } from 'src/app/state/musician/musician.state';
import { ResetRepertoireMarch } from 'src/app/state/repertoire/repertoire-march.actions';

@Component({
  selector: 'app-modal-edit-repertoire-march-soloist',
  templateUrl: './modal-edit-repertoire-march-soloist.component.html',
  styleUrls: ['./modal-edit-repertoire-march-soloist.component.scss'],
})
export class ModalEditRepertoireMarchSoloistComponent implements OnInit {

  @Select(MusicianState.musiciansGroupByVoice)
  musiciansGroupByVoice$: Observable<MusicianGroupByVoice[]>;
  musiciansGroupByVoiceSubscription: Subscription;    
  public musiciansGroupByVoice: MusicianGroupByVoice[];
  public musicians: Musician[];
  
  @Input() categoryId: number;
  @Input() repertoireMarch: RepertoireMarch;
  @Input() updating: boolean;
  
  public initScreen = false;  
  public initSearchMusiciansFinish = false;

  constructor(    
    private store:Store,
    private modalController: ModalController,
    private loadingService: LoadingService,    
    private userService: UsersService,
    private toast:ToastService,   
    private popoverController: PopoverController,
    private alertController: AlertController,
  ) { }

  async ngOnInit() {            
    this.store.dispatch(new GetMusiciansGroupByVoice({name: ''}));                
    this.getMusiciansGroupByVoice();      

    if(!this.repertoireMarch.repertoireMarchSolos) {
      this.repertoireMarch.repertoireMarchSolos = [];
    }

    if(this.repertoireMarch.repertoireMarchSolos.length == 0){
      this.addSolo();
    }
    
  }

  async dismissInitialLoading(){
    if(this.initScreen && this.initSearchMusiciansFinish){
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
    if (this.musiciansGroupByVoiceSubscription) {      
      this.musiciansGroupByVoiceSubscription.unsubscribe();  
    }
    this.store.dispatch(new ResetMusician({})).subscribe({ next: async () => { } })
    this.store.dispatch(new ResetRepertoireMarch({})).subscribe({ next: async () => { } })    
  }


  async getMusiciansGroupByVoice(){      
    this.musiciansGroupByVoiceSubscription = this.musiciansGroupByVoice$.subscribe({
        next: async ()=> {                
          const finish = this.store.selectSnapshot(MusicianState.finish);          
          const errorStatusCode = this.store.selectSnapshot(MusicianState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(MusicianState.errorMessage);               
          if(finish){             
            if(errorStatusCode==200){      
              this.musiciansGroupByVoice = this.store.selectSnapshot(MusicianState.musiciansGroupByVoice);
              if(!this.musiciansGroupByVoice){
                this.musiciansGroupByVoice = [];
              }    
              // volvamos en el array de musicians los musiccos sin agrupar (tenemos que filtrar grupos sin musicos)              
              this.musicians = this.musiciansGroupByVoice
                                        .filter(group => group.voice.name.indexOf("1") >-1)
                                        .filter(({ musicians }) => musicians && musicians.length > 0)
                                        .map(({ musicians }) => musicians).reduce((acc, val) => acc.concat(val), []);
              this.initSearchMusiciansFinish = true;     
              this.dismissInitialLoading();                
            }
            else{              
              this.musiciansGroupByVoice = [];              
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){            
                await this.loadingService.dismissLoading();           
                this.cancel();     
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
                this.initSearchMusiciansFinish = true;  
                this.dismissInitialLoading();                 
              }          
            }                                          
          }             
        }
      })
  }

  confirm(){
    this.repertoireMarch.categoryId = this.repertoireMarch.category.id;
    this.repertoireMarch.typeId = this.repertoireMarch.type.id;
    this.modalController.dismiss(this.repertoireMarch, 'confirm');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  // Añadir un solo
  addSolo() {
    this.repertoireMarch.repertoireMarchSolos.push({
      id: null,
      name: 'Solo '+ (this.repertoireMarch.repertoireMarchSolos.length + 1),
      order: this.repertoireMarch.repertoireMarchSolos.length + 1,      
      mainSoloists: [],
      secondarySoloists: []
    });
  }

  // Añadir solista principal
  addMainSoloist(soloIndex: number) {
    const solo = this.repertoireMarch.repertoireMarchSolos[soloIndex];
    solo.mainSoloists.push({
      musicianId: null,
      musicianName: '',
      order: solo.mainSoloists.length + 1
    });
  }

  // Añadir solista secundario
  addSecondarySoloist(soloIndex: number) {
    const solo = this.repertoireMarch.repertoireMarchSolos[soloIndex];
    solo.secondarySoloists.push({
      musicianId: null,
      musicianName: '',
      order: solo.secondarySoloists.length + 1
    });
  }

  // Eliminar solo
  async removeSolo(index: number) {
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar el solo?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              ;
            }
          },
          {
            text: 'Si',
            role: 'confirm',
            handler: () => {
              this.repertoireMarch.repertoireMarchSolos.splice(index, 1);
              this.updateSoloOrders();
            }
          }
        ]
    });
    alert.present();      
  }

  updateSoloOrders() {
    this.repertoireMarch.repertoireMarchSolos.forEach((solo, index) => {
      solo.order = index + 1;
    });
  }

  // Eliminar solista principal
  async removeMainSoloist(soloIndex: number, soloistIndex: number) {
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar el solista principal?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              ;
            }
          },
          {
            text: 'Si',
            role: 'confirm',
            handler: () => {
              const solo = this.repertoireMarch.repertoireMarchSolos[soloIndex];
              solo.mainSoloists.splice(soloistIndex, 1);
              this.updateMainSoloistOrders(soloIndex);
            }
          }
        ]
    });
    alert.present();          
  }

  updateMainSoloistOrders(soloIndex: number) {
    const solo = this.repertoireMarch.repertoireMarchSolos[soloIndex];
    solo.mainSoloists.forEach((soloist, index) => {
      soloist.order = index + 1;
    });
  }

  // Eliminar solista secundario
  async removeSecondarySoloist(soloIndex: number, soloistIndex: number) {
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar el solista principal?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              ;
            }
          },
          {
            text: 'Si',
            role: 'confirm',
            handler: () => {
              const solo = this.repertoireMarch.repertoireMarchSolos[soloIndex];
              solo.secondarySoloists.splice(soloistIndex, 1);
              this.updateSecondarySoloistOrders(soloIndex);
            }
          }
        ]
    });
    alert.present();          
  }

  updateSecondarySoloistOrders(soloIndex: number) {
    const solo = this.repertoireMarch.repertoireMarchSolos[soloIndex];
    solo.secondarySoloists.forEach((soloist, index) => {
      soloist.order = index + 1;
    });
  }

  // Abre un modal o popover para seleccionar músicos (simplificado)
  async openSelectMusiciansModal(type: 'main' | 'secondary', soloIndex: number) {
    const popover = await this.popoverController.create({
      component: MusicianSelectorComponent,
      componentProps: {
        musicians: this.musicians,
      },
      event: event, // Posición relativa al evento del clic
      translucent: true,
    });

    popover.onDidDismiss().then((data) => {
      if (data.data) {        
        const selectedMusician = { musicianId: data.data.id, musicianName: data.data.name + " " + data.data.surname };                  
        if (type === 'main') {
          this.addSelectedMainSoloist(soloIndex, selectedMusician);
        } else {
          this.addSelectedSecondarySoloist(soloIndex, selectedMusician);
        }
      }
    });

    return await popover.present();
  }

  addSelectedMainSoloist(soloIndex: number, musician: any) {
    const solo = this.repertoireMarch.repertoireMarchSolos[soloIndex];
    solo.mainSoloists.push({
      musicianId: musician.musicianId,
      musicianName: musician.musicianName,
      order: solo.mainSoloists.length + 1
    });
  }

  addSelectedSecondarySoloist(soloIndex: number, musician: any) {
    const solo = this.repertoireMarch.repertoireMarchSolos[soloIndex];
    solo.secondarySoloists.push({
      musicianId: musician.musicianId,
      musicianName: musician.musicianName,
      order: solo.mainSoloists.length + 1
    });
  }

  reorderMainSoloists(event: any, soloIndex: number) {
    const solo = this.repertoireMarch.repertoireMarchSolos[soloIndex];
    const itemToMove = solo.mainSoloists.splice(event.detail.from, 1)[0];
    solo.mainSoloists.splice(event.detail.to, 0, itemToMove);
    // Actualizamos el orden según la posición en la lista
    solo.mainSoloists.forEach((soloist, idx) => {
      soloist.order = idx + 1;
    });
    event.detail.complete();
  }

  reorderSecondarySoloists(event: any, soloIndex: number) {
    const solo = this.repertoireMarch.repertoireMarchSolos[soloIndex];
    const itemToMove = solo.secondarySoloists.splice(event.detail.from, 1)[0];
    solo.secondarySoloists.splice(event.detail.to, 0, itemToMove);
    // Actualizamos el orden según la posición en la lista
    solo.secondarySoloists.forEach((soloist, idx) => {
      soloist.order = idx + 1;
    });
    event.detail.complete();
  }

}
