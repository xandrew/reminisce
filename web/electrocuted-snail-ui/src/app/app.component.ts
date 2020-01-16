import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'electrocuted-snail-ui';

  constructor() {
    this.ids = [0];
    this.nextId = 1;
  }

  fileSelected() {
    this.ids.push(this.nextId);
    this.nextId += 1;
  }

  removeId(id) {
    this.ids.splice( this.ids.indexOf(id), 1 );
  }
}
