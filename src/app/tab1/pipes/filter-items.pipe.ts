import { Pipe, PipeTransform } from '@angular/core';
import { Item } from '../models/item';
import { Category } from 'src/app/tab2/models/category';

@Pipe({
  name: 'filterItems'
})
export class FilterItemsPipe implements PipeTransform {

  transform(value: Item[], category:Category): Item[] {
    if(category && category._id){
      return value.filter(item => item.category && item.category.name==category.name);
    }
    else{
      return value.filter(item => !item.category);
    }
  }

}
