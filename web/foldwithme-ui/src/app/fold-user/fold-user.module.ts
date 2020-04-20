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

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {
    this.http.get('/login_state').subscribe(resp => {
      console.log(resp);
      if (resp['email']) {
        this.email = resp['email'];
	this.given_name = resp['given_name'];
	this.picture = this.sanitizer.bypassSecurityTrustUrl(resp['picture']);
      }
    });
  }
}
