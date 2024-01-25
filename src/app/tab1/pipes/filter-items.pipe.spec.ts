import { Category } from 'src/app/tab2/models/category';
import { FilterItemsPipe } from './filter-items.pipe';
import { Item } from '../models/item';

describe('FilterItemsPipe', () => {
    let pipe: FilterItemsPipe;
    let category1:Category;
    let category2:Category;
    let empty:Category;
    let items: Item[];

    beforeEach( () => {
      pipe = new FilterItemsPipe;
      items = [
        {
          _id:'1',
          description:'Item 1',
          quantity:1,
          category:null,
          user:null,
          status: false
        },
        {
          _id:'2',
          description:'Item 2',
          quantity:1,
          unit:'g',
          category:{
            name:'FRUTAS',
            user: null
          },
          user:null,
          status: false
        }
      ]

      category1 = {
        _id:'1',
        name: 'FRUTAS',
        user:null
      }

      category2 = {
        _id:'2',
        name: 'CARNES',
        user:null
      }

      empty = {
        _id:null,
        name: 'SIN CATEGORIA',
        user:null
      }
    })

    // casos de uso
    it('empty category', () => {
      expect(pipe.transform(items,empty)).toEqual(
        [
          {
            _id:'1',
            description:'Item 1',
            quantity:1,
            category:null,
            user:null,
            status: false
          }
        ]
      )
    });

    it('category is null', () => {
      expect(pipe.transform(items,null)).toEqual(
        [
          {
            _id:'1',
            description:'Item 1',
            quantity:1,
            category:null,
            user:null,
            status: false
          }
        ]
      )
    });

    it('with category', () => {
      expect(pipe.transform(items,category1)).toEqual(
        [
          {
            _id:'2',
            description:'Item 2',
            quantity:1,
            unit:'g',
            category:{
              name:'FRUTAS',
              user: null
            },
            user:null,
            status: false
          }
        ]
      )
    });

    it('not exists category', () => {
      expect(pipe.transform(items,category2)).toEqual(
        []
      )
    });

});
