import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { UsersService } from '../services/user/users.service';
import { StorageService } from '../services/storage/storage.service';
import { LoadingService } from '../services/loading/loading.service';
import { UsersState } from '../state/user/users.state';
import { UserResponse } from '../models/user/user-response';
import { GetUser, ResetUser, UpdateUserDetail, UpdateUserPassword } from '../state/user/users.actions';
import { ToastService } from '../services/toast/toast.service';
import { DEFAULT_USER_IMAGE } from '../constants/constants';
import { GetMusicianFromDni, ResetMusician, UpdateMusician } from '../state/musician/musician.actions';
import { MusicianState } from '../state/musician/musician.state';
import { Musician } from '../models/musician/musician';
import { AlertController, ModalController } from '@ionic/angular';
import { CameraService } from '../services/camera/camera.service';
import { User } from '../models/user/user';
import { ModalChangePasswordComponent } from './components/modal-change-password/modal-change-password.component';

@Component({
  selector: 'app-menu-profile',
  templateUrl: './menu-profile.page.html',
  styleUrls: ['./menu-profile.page.scss'],
})
export class MenuProfilePage implements OnDestroy {

  userSubscription: Subscription;
  @Select(UsersState.user)
  user$: Observable<UserResponse>;
  public user: UserResponse;

  public profile: string;    
  public initScreen = false;
  public initSearchFinish = false;  

  public showImage: string;
  public selectedImage: string;
  public imageLoaded: boolean = false; // Controla la carga de la imagen

  public musicianAntiquity: string;

  constructor(
    private userService: UsersService,
    private storage: StorageService,
    private loadingService: LoadingService,
    private store:Store,
    private toast:ToastService,    
    private alertController: AlertController,  
    private cameraService: CameraService,
    private modalController:ModalController,
  ) {
    
  }

  logout(){
    this.doDestroy();
    this.userService.logout();
  }

  async ionViewWillEnter(){      
    this.store.dispatch(new ResetUser({})).subscribe({ next: async () => { } })    
    this.store.dispatch(new ResetMusician({})).subscribe({ next: async () => { } })    
    this.profile = await this.storage.getItem('profile');             
    let userApp = JSON.parse(await this.storage.getItem('user'));   
    this.musicianAntiquity = this.calculateAntiquity(userApp);
    this.getUser();      
    this.searchUser(userApp.username);        
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
    console.log("ngOnDestroy profile");
    if (this.userSubscription) {      
      this.userSubscription.unsubscribe();  // Cancelar la suscripción al destruir el componente
    }
    this.store.dispatch(new ResetUser({})).subscribe({ next: async () => { } })    
  }

  inputUpperCase(event: any, element: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase(); 
    element = input.value; 
  }

  // Función para manejar la carga de la imagen
  onImageLoad() {
    this.imageLoaded = true;    
  }

  /*******************************************************/
  /********************** USERS **************************/
  /*******************************************************/
  async searchUser(username:string, showLoading:boolean=true){
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');
    }          
    this.store.dispatch(new GetUser({username: username}));        
  }

  async getUser(){            
    this.userSubscription = this.user$     
      .subscribe({
        next: async ()=> {                
          const finish = this.store.selectSnapshot(UsersState.finish);          
          const errorStatusCode = this.store.selectSnapshot(UsersState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(UsersState.errorMessage);  
          
          if(finish){               
            if(errorStatusCode==200){      
              this.user = this.store.selectSnapshot(UsersState.user);   
              this.user.password = "*********************";
              if(this.user.image){
                this.showImage = `data:image/jpeg;base64,${this.user.image}`;
                this.selectedImage = this.user.image;
                this.imageLoaded = false; // Iniciar la carga de la imagen
              }
              else{
                this.showImage = `data:image/jpeg;base64,${DEFAULT_USER_IMAGE}`;
                this.selectedImage = DEFAULT_USER_IMAGE;
                this.imageLoaded = true; // Imagen por defecto ya está cargada
              }                          
            }
            else{                        
              // si el token ha caducado (403) lo sacamos de la aplicacion
              if(errorStatusCode==403){            
                this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
              }
              else{
                this.toast.presentToast(errorMessage);
              }          
            }                                    
            this.initSearchFinish = true;    
            this.dismissInitialLoading();                 
          }            
        }
      })
  }

  async selectImage() {        
    this.selectedImage =  await this.cameraService.getPhotoBase64(90);
    this.imageLoaded = false; // Mostrar el Skeleton Loader
    this.showImage = `data:image/jpeg;base64,${this.selectedImage}`;    
  }

  clearImage() {    
    this.showImage = `data:image/jpeg;base64,${DEFAULT_USER_IMAGE}`;
    this.selectedImage = DEFAULT_USER_IMAGE;
    this.imageLoaded = true; // La imagen por defecto ya está cargada    
  }


  async updateUserMusician(){
    // miramos si el usuario es musico (a partir del username)
    await this.loadingService.presentLoading('Loading...');    
    this.store.dispatch(new GetMusicianFromDni({dni:this.user.username}))
      .subscribe({
        next: async ()=> {
          const finish = this.store.selectSnapshot(MusicianState.finish);          
          const errorStatusCode = this.store.selectSnapshot(MusicianState.errorStatusCode);          
          
          if(finish){                        
            if(errorStatusCode==200){     
              let musicianId = this.store.selectSnapshot(MusicianState.musician).id;
              
              if(musicianId){                                    
                this.doUpdateUserMusician(this.user, musicianId,this.store.selectSnapshot(MusicianState.musician),false);
              }
              else{                  
                this.doUpdateUser(this.user, false, false);
              }        
            }
            else if(errorStatusCode==204){                
              this.doUpdateUser(this.user, false, false);
            }
            else{
              this.toast.presentToast("Error al obtener la informacion del usuario");
              this.dismissInitialLoading();                 
            }                                                
          }      
        }
      }
    )  
  }

  async doUpdateUser(data:UserResponse, changeDni:boolean, showLoading:boolean=true){     
    
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');         
    }

    this.user.image = this.selectedImage;
    this.store.dispatch(new UpdateUserDetail({user:data})).subscribe({
      next: async ()=> {
        const success = this.store.selectSnapshot(UsersState.success);
        if(success){
          this.toast.presentToast("Usuario actualizado correctamente");      
                  
          // si hemos actualizado un usuario desde su perfil, almacenamos los datos en el storage, por si abren el menu de la izquierda poder pintarlos actualizados
          this.storage.setItem('userRewriteData', JSON.stringify(this.user));

          await this.loadingService.dismissLoading();    
          
          // si ha cambiado el dni de un usuario tipo musico, mandamos al login
          if(changeDni){
            this.userService.logout("Se redirige al login puesto que ha cambiado su nombre de usuario (DNI)");
          }
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(UsersState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(UsersState.errorMessage);        
          // si el token ha caducado (403) lo sacamos de la aplicacion
          if(errorStatusCode==403){            
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

  async doUpdateUserMusician(data:UserResponse, musicianId:number,musician: Musician, showLoading:boolean=true){     
    
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');         
    }

    let changeDni = false;

    if(data.dni!==musician.dni){
      changeDni = true;
    }
    // actualizamos los datos del musician
    musician.dni = data.dni;
    musician.name = data.name;
    musician.surname = data.surname;
    musician.direction = data.direction;
    musician.municipality = data.municipality;
    musician.province = data.province;
    musician.email = data.email;
    musician.image = this.selectedImage;
    musician.voiceId = musician.voice.id;
    musician.phoneNumber = data.phoneNumber;

    if(changeDni){
      await this.loadingService.dismissLoading();  
      const alert = await this.alertController.create({
          header: '¡Aviso!',
          message: 'Ha cambiado el dni del usuario, por tanto se va a regenerar el password, que será la misma del DNI pero con la letra en minuscula. </br> ¿Desea continuar con la actualización? </br> Se le redigira a la pantalla de login para entrar de nuevo a la app',
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
                this.doConfirmUpdateUserMusician(data,musicianId,musician,changeDni,true);
              }
            }
          ]
      });
      alert.present();
    }
    else{
      this.doConfirmUpdateUserMusician(data,musicianId,musician,changeDni,false);
    }    
  }

  async doConfirmUpdateUserMusician(data:UserResponse, musicianId:number,musician: Musician, changeDni:boolean, showLoading:boolean=true){     
    if(showLoading){
      await this.loadingService.presentLoading('Loading...');         
    }

    this.store.dispatch(new UpdateMusician({id: musicianId, musician:musician})).subscribe({
      next: async ()=> {
        const success = this.store.selectSnapshot(MusicianState.success);
        if(success){
          data.username = musician.dni;
          this.doUpdateUser(data,changeDni, false);          
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(MusicianState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(MusicianState.errorMessage);        
          // si el token ha caducado (403) lo sacamos de la aplicacion
          if(errorStatusCode==403){            
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

  calculateAntiquity(userApp:User): string {

    if(this.profile=='MUSICO'){
      let startDate = userApp.musician.registrationDate;

      if (!startDate) return 'Sin antigüedad';

      const start = new Date(startDate);
      const now = new Date();

      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      let days = now.getDate() - start.getDate();

      // Ajustar años y meses si el mes/día actual es menor que el mes/día de inicio
      if (days < 0) {
          months--; // Restar un mes
          const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Último día del mes anterior
          days += lastMonth.getDate(); // Sumar los días del mes anterior
      }

      if (months < 0) {
          years--; // Restar un año
          months += 12; // Ajustar meses
      }

      return `${years} años, ${months} meses y ${days} días`;
    }
    else{
      return '';
    }
    
  } 

  async openModalChangePassword(){
    // mostramos spinner
    await this.loadingService.presentLoading('Loading...');   

    // mostramos la modal
    const modal = await this.modalController.create({
      component: ModalChangePasswordComponent,
      componentProps: {
        username: this.user.username
      }
    });
    modal.present();
  }

}
