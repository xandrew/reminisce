import { Component } from '@angular/core';

import { FoldUserModule } from './fold-user/fold-user.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'foldwithme-ui';

  constructor(private fold_user: FoldUserModule) {
    console.log(fold_user);
  }
}
