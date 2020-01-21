import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';

class ElectrocuteResponse {
  here: string;
}

class ElectrocuteRequest {
  xyz: string;
  constructor(xyz: string) {
    this.xyz = xyz;
  }
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'electrocuted-snail-ui';
  ids: number[];
  nextId: number;
  files: object;

  constructor(private http: HttpClient) {
    this.ids = [0];
    this.nextId = 1;
    this.files = {};
  }

  fileSelected() {
    this.ids.push(this.nextId);
    this.nextId += 1;
  }

  removeId(id) {
    this.ids.splice( this.ids.indexOf(id), 1 );
  }

  gotFile(id, file) {
    this.files[id] = file;
  }

  sendRequest(f) {
    console.log(f)
    var fd = new FormData(f);
    this.http.post('/electrocute', fd).subscribe(resp => {
      console.log(resp);
    });
  }
}
