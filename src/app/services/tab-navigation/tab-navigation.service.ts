// tab-navigation.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabNavigationService {
  private tabChangeSubject = new Subject<string>();
  tabChange$ = this.tabChangeSubject.asObservable();

  changeTab(tab: string) {
    this.tabChangeSubject.next(tab);
  }
}
