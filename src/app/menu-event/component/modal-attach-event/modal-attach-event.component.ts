import { Component, Input, OnInit } from '@angular/core';
import { Filesystem } from '@capacitor/filesystem';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { AlertController, ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { DEFAULT_EVENT_IMAGE } from 'src/app/constants/constants';
import { CloudDocument } from 'src/app/models/clouddocument/cloud-document';
import { Event as CustomEvent } from 'src/app/models/event/event';
import { FileManagerService } from 'src/app/services/filemanager/file-manager.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { DeleteCloudDocument, DownloadCloudDocument, GetCloudDocuments, ResetCloudDocument, UploadCloudDocument } from 'src/app/state/cloud-document/cloud-document.actions';
import { CloudDocumentState } from 'src/app/state/cloud-document/cloud-document.state';

@Component({
  selector: 'app-modal-attach-event',
  templateUrl: './modal-attach-event.component.html',
  styleUrls: ['./modal-attach-event.component.scss'],
})
export class ModalAttachEventComponent implements OnInit {

  @Select(CloudDocumentState.documents)
  cloudDocuments$: Observable<CloudDocument[]>;
  cloudDocumentsSubscription: Subscription;
  public cloudDocuments: CloudDocument[];  
  
  @Input() event: CustomEvent;
  @Input() date: string;
  @Input() type: string;

  public initScreen = false;
  public initSearchFinish = false;  
  public showImage: string;  
  public showTextEvent: string;
  public showDateTextEvent: string;
  public profile: string;  
  public loadFinish = false;
  public uploadDocument;


  constructor(        
    private store:Store,
    private modalController: ModalController,
    private toast:ToastService,
    private userService: UsersService,
    private loadingService: LoadingService,    
    private storage: StorageService,
    private fileManagerService: FileManagerService,
    private alertController: AlertController
    ) { }

  convertDateFormat(dateString: string): string {
    // Divide la cadena en sus partes (año, mes, día)
    const [year, month, day] = dateString.split('-');
    
    // Retorna la fecha en el nuevo formato
    return `${day}-${month}-${year}`;
  }

  async ngOnInit() {   
    
    this.initScreen = false;
    this.initSearchFinish = false;  
    this.loadFinish = false;
    
    this.store.dispatch(new ResetCloudDocument({})).subscribe({ next: async () => { } })        
    if(this.event.image){
      this.showImage = `data:image/jpeg;base64,${this.event.image}`;      
    }
    else{
      this.showImage = `data:image/jpeg;base64,${DEFAULT_EVENT_IMAGE}`;      
    }   
  
    if(this.type === 'REHEARSAL'){
      this.showTextEvent = this.event.title?this.event.title:"Ensayo General";
      if(this.event.location){
        this.showTextEvent = this.showTextEvent + " (" + this.event.location + ")";
      }
      this.showDateTextEvent = this.convertDateFormat(this.event.date) + " (" + this.event.startTime + " - " + this.event.endTime + ")";
    }
    else {
      this.showTextEvent = this.event.title.trim();
      if(this.event.municipality){
        this.showTextEvent = this.showTextEvent + " (" + this.event.municipality.trim() + ")";
      }
      this.showDateTextEvent = this.convertDateFormat(this.event.date) + " (" + this.event.startTime + " - " + this.event.endTime + ")";
    }   
    
    this.profile = await this.storage.getItem('profile');        
    
    this.store.dispatch(new GetCloudDocuments({folderGoogleId: this.event.googleId}));    
    this.getCloudDocuments();   

  }

  async dismissInitialLoading(){
    if(this.initScreen && this.initSearchFinish){      
      this.loadFinish = true;
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
    if (this.cloudDocumentsSubscription) {      
      this.cloudDocumentsSubscription.unsubscribe();  
    }            
    this.cloudDocuments = [];    
    this.store.dispatch(new ResetCloudDocument({})).subscribe({ next: async () => { } })            
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  getCloudDocuments(){
    this.cloudDocumentsSubscription = this.cloudDocuments$.subscribe({
      next: async ()=> {                        
        const finish = this.store.selectSnapshot(CloudDocumentState.finish)        
        const errorStatusCode = this.store.selectSnapshot(CloudDocumentState.errorStatusCode)        
        const errorMessage = this.store.selectSnapshot(CloudDocumentState.errorMessage)                
        if(finish){       
          this.initSearchFinish = true;  
          if(errorStatusCode==200){          
            this.cloudDocuments = this.store.selectSnapshot(CloudDocumentState.documents);                                        
          }
          else{            
            if(errorStatusCode==403){     
              await this.loadingService.dismissLoading();            
              this.cancel();     
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              this.toast.presentToast(errorMessage);
            }                
          }
          this.dismissInitialLoading();              
        }
      }
    })
  }

  trackByDocument(index, document) {    
    return document.googleId; // Utiliza un identificador único de tu elemento
  }

  async downloadDocument(document:CloudDocument){       
    // muestro este loading, porque el otro me movia el scroll       
    await this.loadingService.presentLoading('Loading...');   
    
    this.store.dispatch(new DownloadCloudDocument({documentGoogleId: document.googleId}))        
      .subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(CloudDocumentState.success);
          if(success){            
            const documentDownload = this.store.selectSnapshot(CloudDocumentState.document);     
            this.fileManagerService.showFile(document.name, documentDownload.content, documentDownload.mimeType);            
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(CloudDocumentState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(CloudDocumentState.errorMessage);        
            // si el token ha caducado (403) lo sacamos de la aplicacion
            if(errorStatusCode==403){    
              await this.loadingService.dismissLoading();            
              this.cancel();             
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              this.toast.presentToast(errorMessage);
            }              
          }    
          await this.loadingService.dismissLoading();           
        },
        error: async () => {
          await this.loadingService.dismissLoading();                                   
        }
      }
    )
  }

  async selectAndUpload() {
    try {             
      const { files } = await FilePicker.pickFiles({
        multiple: false,        
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

      this.uploadDocument = new CloudDocument();
      this.uploadDocument.name = file.name;
      this.uploadDocument.mimeType = mimeType;
      this.uploadDocument.content = base64;
      this.uploadDocument.googleId = "";
      this.uploadDocument.folderGoogleId = this.event.googleId;

      this.upload();
    } catch (error) {
      if (error.message === 'User canceled file pick.') {
        console.log('El usuario canceló la selección');
        await this.loadingService.dismissLoading();                                   
      } else {
        this.toast.presentToast('Error al seleccionar archivo');        
        await this.loadingService.dismissLoading();                                   
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

  async upload(){
    await this.loadingService.presentLoading('Loading...');  
    this.store.dispatch(new UploadCloudDocument({cloudDocument: this.uploadDocument}))        
      .subscribe({
        next: async ()=> {
          const success = this.store.selectSnapshot(CloudDocumentState.success);
          if(success){
            this.toast.presentToast("Documento subido correctamente correctamente");            
            this.store.dispatch(new GetCloudDocuments({folderGoogleId: this.event.googleId}));     
          }
          else{
            const errorStatusCode = this.store.selectSnapshot(CloudDocumentState.errorStatusCode);
            const errorMessage = this.store.selectSnapshot(CloudDocumentState.errorMessage);        
            // si el token ha caducado (403) lo sacamos de la aplicacion
            if(errorStatusCode==403){    
              await this.loadingService.dismissLoading();            
              this.cancel();             
              this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
            }
            else{
              this.toast.presentToast(errorMessage);
            }    
            await this.loadingService.dismissLoading();      
          }          
        }
      }
    ) 
  }

  async confirmDeleteDocument(event: Event, document:CloudDocument) {
    event.stopPropagation(); // Detener la propagación del evento de clic
    
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar el documento?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {}
          },
          {
            text: 'Si',
            role: 'confirm',
            handler: () => {
              this.deleteDocument(document);
            }
          }
        ]
    });
    alert.present();
  }

  async deleteDocument(document:CloudDocument) {    
    // eliminamos la voz    
    await this.loadingService.presentLoading('Loading...');    
    this.store.dispatch(new DeleteCloudDocument({documentGoogleId: document.googleId})).subscribe({
      next: async () => {
        const success = this.store.selectSnapshot(CloudDocumentState.success);
        if(success){          
          this.toast.presentToast("Documento eliminado correctamente");
          this.store.dispatch(new GetCloudDocuments({folderGoogleId: this.event.googleId}));              
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(CloudDocumentState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(CloudDocumentState.errorMessage);        
          // si el token ha caducado (403) lo sacamos de la aplicacion
          if(errorStatusCode==403){     
            await this.loadingService.dismissLoading();            
            this.cancel();            
            this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
          }
          else{
            this.toast.presentToast(errorMessage);
          }    
          await this.loadingService.dismissLoading();      
        }          
      }
    })
  }

  
}
