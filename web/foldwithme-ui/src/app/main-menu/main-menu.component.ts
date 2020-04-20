import { Component, OnInit } from '@angular/core';

import { FoldUserModule } from '../fold-user/fold-user.module';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {

  constructor(private fold_user: FoldUserModule) {
  }

  ngOnInit() {
  }

}
