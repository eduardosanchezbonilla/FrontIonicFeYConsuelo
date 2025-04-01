import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { ContractGroup } from 'src/app/models/contract-group/contract-group';
import { Contract } from 'src/app/models/contract/contract';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { GetContractGroups } from 'src/app/state/contract-group/contract-group.actions';
import { ContractGroupState } from 'src/app/state/contract-group/contract-group.state';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Filesystem } from '@capacitor/filesystem';

@Component({
  selector: 'app-modal-contract',
  templateUrl: './modal-contract.component.html',
  styleUrls: ['./modal-contract.component.scss'],
})
export class ModalContractComponent implements OnInit, OnDestroy {

  @Select(ContractGroupState.contractGroups)
  contractGroups$: Observable<ContractGroup[]>;
  contractGroupsSubscription: Subscription;
  public contractGroups: ContractGroup[];

  @Input() contract: Contract;
  @Input() updating: boolean;
  
  public initScreen = false;
  public initSearchFinish = false;

  public contractGroup: ContractGroup;

  constructor(
    private store:Store,
    private modalController: ModalController,
    private loadingService: LoadingService,
    private userService: UsersService,
    private toast:ToastService,
  ) { }

  async ngOnInit() {
   /* if(!this.contract){
      this.contract = new Contract();            
    }  
    else{
      let contractGroup  = new ContractGroup();
      contractGroup.id = this.contract.videoCategoryId;
      this.video.videoCategory = videoCategory;
      this.thumbnailUrl = `https://img.youtube.com/vi/${this.video.youtubeId}/0.jpg`;
    }  */
    this.store.dispatch(new GetContractGroups({}));
    this.getContractGroups();        
  }

  async dismissInitialLoading(){
    if(this.initScreen && this.initSearchFinish){
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
    console.log("ngOnDestroy contract");
    if (this.contractGroupsSubscription) {      
      this.contractGroupsSubscription.unsubscribe();  
    }        
  }

  compareWith(o1: ContractGroup, o2: ContractGroup){
    return o1 && o2 ? o1.id == o2.id : o1===o2;
  }

  getContractGroups(){
    this.contractGroupsSubscription = this.contractGroups$.subscribe({
      next: async ()=> {
        const finish = this.store.selectSnapshot(ContractGroupState.finish);      
        if(finish){
          const errorStatusCode = this.store.selectSnapshot(ContractGroupState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(ContractGroupState.errorMessage);  
          if(errorStatusCode==200){
            this.contractGroups = this.store.selectSnapshot(ContractGroupState.contractGroups);            
            this.initSearchFinish = true;    
            this.dismissInitialLoading();      
          }
          else{
            if(errorStatusCode==403){   
              await this.loadingService.dismissLoading();           
              this.cancel();     
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              this.toast.presentToast(errorMessage);
              this.initSearchFinish = true;    
              this.dismissInitialLoading();     
            }
          }          
        }        
      }
    })
  }

  confirm(){
    this.modalController.dismiss(this.contract, 'confirm');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  closeModal(modal: IonModal) {
    modal.dismiss();
  }

  async selectAndUpload() {
    try {
      // Pedimos un solo archivo
      const { files } = await FilePicker.pickFiles({
        multiple: false,
        // Puedes filtrar tipos con "types" si lo deseas,
        // p. ej: types: ['image/*', 'application/pdf']
      });

      if (!files.length) {
        console.log('No se seleccionó ningún archivo');
        return;
      }

      // Tomamos el primer archivo
      const file = files[0];
      
      // file trae:
      // - name, size, mimeType
      // - blob (si está disponible en la plataforma)
      // - path, webPath (para usar con Filesystem si no hay blob)

      // Obtenemos el MIME type (si file.mimeType es undefined, definimos uno por defecto)
      const mimeType = file.mimeType ?? 'application/octet-stream';

      // Convertimos a base64
      const base64 = await this.convertToBase64(file);

      this.contract = new Contract();
      this.contract.name = file.name;
      this.contract.mimeType = mimeType;
      this.contract.content = base64;
      this.contract.googleId = "";
      this.contract.folderGoogleId = this.contractGroup.googleId;

      this.confirm();
    } catch (error) {
      if (error.message === 'User canceled file pick.') {
        console.log('El usuario canceló la selección');
      } else {
        this.toast.presentToast('Error al seleccionar archivo');        
      }
    }
  }

  async convertToBase64(file: any): Promise<any> {
    // 1. Si el plugin te proporciona un `blob`, es lo más sencillo:
    if (file.blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // El "reader.result" será algo como: "data:<mime>;base64,<contenido>"
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file.blob);
      });
    }

    // 2. Si no hay blob, usamos el plugin Filesystem con "path" o "webPath"
    if (file.path) {
      const lectura = await Filesystem.readFile({ path: file.path });
      return lectura.data; // Esto ya es base64
    } else if (file.webPath) {
      // A veces en iOS el plugin retorna webPath
      const lectura = await Filesystem.readFile({ path: file.webPath });
      return lectura.data;
    }

    throw new Error('No se pudo convertir a base64: no hay blob ni path disponible');
  }

}
