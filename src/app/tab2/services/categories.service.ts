import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Category } from '../models/category';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { UpdateCategoryDto } from '../models/update-category-dto';

@Injectable()
export class CategoriesService {

  constructor(private storage: StorageService) { }

  async createCategory(category:Category){
    const token = await this.storage.getItem('token');
    return Http.post(
      {
        url:environment.host + '/categories',
        params:{},
        data:category,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {
      if(response.status==201){
        const data = await response.data;
        return data;
      }
      return null;
    })
  }

  async getCategories(user:string){
    const token = await this.storage.getItem('token');
    return Http.get(
      {
        url:environment.host + '/categories',
        params:{'user':user},
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {
      if(response.status==200){
        const data = await response.data as Category[];
        return data;
      }
      return null;
    })
  }

  async updateCategory(updateCategoryDto:UpdateCategoryDto){
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/categories',
        params:{},
        data:updateCategoryDto,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {
      if(response.status==200){
        const data = await response.data as Category;
        return data;
      }
      return null;
    })
  }

  async deleteCategory(id:string){
    const token = await this.storage.getItem('token');
    return Http.del(
      {
        url:environment.host + '/categories/'+ id,
        params:{},        
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {
      if(response.status==200){
        const data = await response.data as boolean;
        return data;
      }
      return null;
    })
  }

}
