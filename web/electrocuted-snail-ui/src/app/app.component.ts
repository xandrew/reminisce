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
    //console.log(f.formDirective);
    var fd = new FormData(f);
    //for (let id of this.ids) {
    //  if (this.files[id]) {
    //    fd.append('file' + id, this.files[id], this.files[id].name);
    //  }
    //}
    for (var pair of fd.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }
    //var req = new ElectrocuteRequest("hahoka");
    this.http.post('http://localhost:8080/electrocute', fd).subscribe(resp => {
      console.log(resp);
    });
  }
}
