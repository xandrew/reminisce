import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { map, switchMap, filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-pictures',
  templateUrl: './user-pictures.component.html',
  styleUrls: ['./user-pictures.component.scss']
})
export class UserPicturesComponent implements OnInit {

  constructor(
      private http: HttpClient,
      private sanitizer: DomSanitizer,
      private router: Router) { }

  pictures = [];
  private subs: Subscription[] = [];

  ngOnInit() {
    this.subs.push(
        this.http.get<object[]>(
	    '/get_user_pictures').subscribe(data => {
      this.pictures = data;
      for (var entry of this.pictures) {
        entry.picture = this.sanitizer.bypassSecurityTrustUrl(entry.picture);
      }
    }));
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
