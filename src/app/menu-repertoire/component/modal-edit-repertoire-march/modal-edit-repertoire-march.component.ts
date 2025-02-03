import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { DEFAULT_REPERTOIRE_MARCH_IMAGE } from 'src/app/constants/constants';
import { RepertoireCategory } from 'src/app/models/repertoire-category/repertoire-category';
import { RepertoireMarchType } from 'src/app/models/repertoire-march-type/repertoire-march-type';
import { RepertoireMarch } from 'src/app/models/repertoire/repertoire-march';
import { CameraService } from 'src/app/services/camera/camera.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { GetRepertoireCategories } from 'src/app/state/repertoire-category/repertoire-category.actions';
import { RepertoireCategoryState } from 'src/app/state/repertoire-category/repertoire-category.state';
import { GetRepertoireMarchTypes } from 'src/app/state/repertoire-march-type/repertoire-march-type.actions';
import { RepertoireMarchTypeState } from 'src/app/state/repertoire-march-type/repertoire-march-type.state';

@Component({
  selector: 'app-modal-edit-repertoire-march',
  templateUrl: './modal-edit-repertoire-march.component.html',
  styleUrls: ['./modal-edit-repertoire-march.component.scss'],
})
export class ModalEditRepertoireMarchComponent implements OnInit {

  @Select(RepertoireCategoryState.repertoireCategories)
  repertoireCategories$: Observable<RepertoireCategory[]>;
  repertoireCategoriesSubscription: Subscription;
  public repertoireCategories: RepertoireCategory[];

  @Select(RepertoireMarchTypeState.repertoireMarchTypes)
  repertoireMarchTypes$: Observable<RepertoireMarchType[]>;
  repertoireMarchTypesSubscription: Subscription;
  public repertoireMarchTypes: RepertoireMarchType[];

  @Input() categoryId: number;
  @Input() repertoireMarch: RepertoireMarch;
  @Input() updating: boolean;
  public showImage: string;
  public selectedImage: string;

  public initScreen = false;
  public initSearchCategoriesFinish = false;
  public initSearchTypesFinish = false;

  thumbnailUrl: string | null = 'https://img.youtube.com/vi/notexists/0.jpg';
  defaultThumbnailUrl = 'notexits'; 

  constructor(    
    private store:Store,
    private modalController: ModalController,
    private loadingService: LoadingService,
    private cameraService: CameraService,
    private userService: UsersService,
    private toast:ToastService,   
  ) { }

  async ngOnInit() {
    if(!this.repertoireMarch){
      this.repertoireMarch = new RepertoireMarch();                
      this.showImage = null;      
    }
    else{
      if(this.repertoireMarch.image){
        this.showImage = `data:image/jpeg;base64,${this.repertoireMarch.image}`;
        this.selectedImage = this.repertoireMarch.image;
      }
      else{
        this.showImage = `data:image/jpeg;base64,${DEFAULT_REPERTOIRE_MARCH_IMAGE}`;
        this.selectedImage = DEFAULT_REPERTOIRE_MARCH_IMAGE;
      }                    
    }  

    if(this.categoryId){      
      this.repertoireMarch.categoryId = this.categoryId;      
    }

    if(!this.repertoireMarch.youtubeId){
      this.thumbnailUrl = 'https://img.youtube.com/vi/notexists/0.jpg';
    }  
    else{
      this.thumbnailUrl = `https://img.youtube.com/vi/${this.repertoireMarch.youtubeId}/0.jpg`;
    }  
    
    this.store.dispatch(new GetRepertoireCategories({}));
    this.getRepertoireCategories();   

    this.store.dispatch(new GetRepertoireMarchTypes({}));
    this.getRepertoireMarchTypes();   
    
  }

  async dismissInitialLoading(){
    if(this.initScreen && this.initSearchCategoriesFinish && this.initSearchTypesFinish){
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
    if (this.repertoireCategoriesSubscription) {      
      this.repertoireCategoriesSubscription.unsubscribe();  
    }        
  }

  compareWithRepertoireCategories(o1: RepertoireCategory, o2: RepertoireCategory){
    return o1 && o2 ? o1.id == o2.id : o1===o2;
  }

  getRepertoireCategories(){
    this.repertoireCategoriesSubscription = this.repertoireCategories$.subscribe({
      next: async ()=> {
        const finish = this.store.selectSnapshot(RepertoireCategoryState.finish);          
        if(finish){
          const errorStatusCode = this.store.selectSnapshot(RepertoireCategoryState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(RepertoireCategoryState.errorMessage); 
          if(errorStatusCode==200){
            this.repertoireCategories = this.store.selectSnapshot(RepertoireCategoryState.repertoireCategories).map(({ image, ...rest }) => rest);            
            this.initSearchCategoriesFinish = true;    
            if(this.categoryId){      
              this.repertoireMarch.category = this.repertoireCategories.find(x => x.id == this.categoryId);
            }
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
              this.initSearchCategoriesFinish = true;    
              this.dismissInitialLoading();     
            }
          }
        }        
      }
    })
  }
  
  compareWithRepertoireMarchTypes(o1: RepertoireMarchType, o2: RepertoireMarchType){
    return o1 && o2 ? o1.id == o2.id : o1===o2;
  }

  getRepertoireMarchTypes(){
    this.repertoireMarchTypesSubscription = this.repertoireMarchTypes$.subscribe({
      next: async ()=> {
        const finish = this.store.selectSnapshot(RepertoireMarchTypeState.finish);          
        if(finish){
          const errorStatusCode = this.store.selectSnapshot(RepertoireMarchTypeState.errorStatusCode);          
          const errorMessage = this.store.selectSnapshot(RepertoireMarchTypeState.errorMessage); 
          console.log(errorStatusCode);
          if(errorStatusCode==200){
            this.repertoireMarchTypes = this.store.selectSnapshot(RepertoireMarchTypeState.repertoireMarchTypes).map(({ image, ...rest }) => rest);            
            this.initSearchTypesFinish = true;    
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
              this.initSearchTypesFinish = true;    
              this.dismissInitialLoading();     
            }
          }
        }
      }
    })
  }
  

  confirm(){
    this.repertoireMarch.image = this.selectedImage;
    this.repertoireMarch.categoryId = this.repertoireMarch.category.id;
    this.repertoireMarch.typeId = this.repertoireMarch.type.id;
    this.modalController.dismiss(this.repertoireMarch, 'confirm');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  async selectImage() {        
    this.selectedImage =  await this.cameraService.getPhotoBase64(90);
    this.showImage = `data:image/jpeg;base64,${this.selectedImage}`;        
  }

  clearImage() {
    this.showImage = null;
    this.selectedImage = '';
  }

  loadThumbnail(youtubeId: string) {
    if (youtubeId && youtubeId.length >= 5) {
      this.thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/0.jpg`;
    } else {
      this.thumbnailUrl = `https://img.youtube.com/vi/noptexits/0.jpg`; // Muestra la imagen predeterminada
    }
  }

}
