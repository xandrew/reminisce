import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class FoldUserModule {
  email = '';
  given_name = '';
  picture: SafeUrl;
  galleries = [];

  load_galleries() {
    this.http.get<object[]>('/user_galleries').subscribe(
	resp => {this.galleries = resp; console.log(this.galleries)});
  }

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {
    this.http.get('/login_state').subscribe(resp => {
      if (resp['email']) {
        this.email = resp['email'];
	this.given_name = resp['given_name'];
	this.picture = this.sanitizer.bypassSecurityTrustUrl(resp['picture']);
	this.load_galleries();
      }
    });
  }

  new_gallery(title) {
    this.http.post('/new_gallery', {'title': title}).subscribe(
        resp => this.load_galleries());
  }

  join_gallery(code) {
    this.http.post('/join_gallery', {'code': code}).subscribe(
        resp => this.load_galleries());
  }
}
