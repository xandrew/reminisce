import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'foldwithme-ui';
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  private user_email = '';
  private user_given_name = '';
  private user_picture: SafeUrl;

  ngOnInit() {
    this.http.get('/login_state').subscribe(resp => {
      console.log(resp);
      if (resp['email']) {
        this.user_email = resp['email'];
	this.user_given_name = resp['given_name'];
	this.user_picture = this.sanitizer.bypassSecurityTrustUrl(
	    resp['picture']);
      }
    });
  }

}
