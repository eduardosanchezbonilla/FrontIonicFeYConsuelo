import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { TabNavigationService } from '../services/tab-navigation/tab-navigation.service';

@Component({
  selector: 'app-tabs-admin',
  templateUrl: './tabs-admin.page.html',
  styleUrls: ['./tabs-admin.page.scss'],
})
export class TabsAdminPage implements OnInit, OnDestroy {

  @ViewChild('tabs', { static: true }) tabs: IonTabs;
  private tabChangeSubscription: Subscription;

  constructor(private tabNavigationService: TabNavigationService) {}

  ngOnInit() {
    this.tabChangeSubscription = this.tabNavigationService.tabChange$.subscribe(tab => {
      this.tabs.select(tab);
    });
  }

  ngOnDestroy() {
    if (this.tabChangeSubscription) {
      this.tabChangeSubscription.unsubscribe();
    }
  }
}
