import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../models/item';
import { CategoriesState } from 'src/app/tab2/state/categories.state';
import { Category } from 'src/app/tab2/models/category';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { User } from 'src/app/users/models/user';
import { StorageService } from 'src/app/services/storage/storage.service';
import { GetCategories } from 'src/app/tab2/state/categories.actions';
import { units } from 'src/app/constants/constants';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-item',
  templateUrl: './modal-item.component.html',
  styleUrls: ['./modal-item.component.scss'],
})
export class ModalItemComponent implements OnInit {

  @Select(CategoriesState.categories)
  categories$: Observable<Category[]>;
  
  @Input() item: Item;
  @Input() updating: boolean;
  public categories: Category[];
  public user: User;
  public units: String[]

  constructor(
    private store:Store,
    private storage:StorageService,
    private modalController: ModalController
  ) { }

  async ngOnInit() {
    if(!this.item){
      this.item = new Item();
      this.item.quantity = 1;
    }
    this.units = units;
    this.user = JSON.parse(await this.storage.getItem('user'));
    this.store.dispatch(new GetCategories({user: this.user._id}));
    this.getCategories();
    this.item.user=this.user;
  }

  compareWith(o1: Category, o2:Category){
    return o1 && o2 ? o1._id == o2._id : o1===o2;
  }

  getCategories(){
    this.categories$.subscribe({
      next: ()=> {
        this.categories = this.store.selectSnapshot(CategoriesState.categories);
      }
    })
  }

  confirm(){
    this.modalController.dismiss(this.item, 'confirm');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  

}
