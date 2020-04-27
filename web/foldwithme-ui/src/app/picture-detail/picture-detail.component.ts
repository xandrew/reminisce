import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { map, switchMap, filter, take } from 'rxjs/operators';
import { merge } from 'rxjs';
import { Subject, timer } from 'rxjs/index';

import { FoldUserModule } from '../fold-user/fold-user.module';

@Component({
  selector: 'app-picture-detail',
  templateUrl: './picture-detail.component.html',
  styleUrls: ['./picture-detail.component.scss']
})
export class PictureDetailComponent implements OnInit {

  constructor(
      private fold_user: FoldUserModule,
      private http: HttpClient,
      private sanitizer: DomSanitizer,
      private route: ActivatedRoute,
      private router: Router,
      private location: Location) { }

  id = '';
  galleries = [];
  display_data = undefined;
  galleryReloadSubject = new Subject<string>();
  cont_url = '';
  mailto = '';

  ngOnInit() {
    const routeObs = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('id')));

    routeObs.subscribe(id => {
      this.id = id;
      this.cont_url = (
          location.origin +
	  '/' +
	  this.location.prepareExternalUrl(
              this.router.createUrlTree(['draw', this.id]).toString()));
      this.mailto = encodeURI(
          'mailto:?subject=Continue my drawing!&body=Just follow this URL:\n' +
	  this.cont_url);
    });
    
    routeObs.pipe(
      switchMap(id => this.http.get('/picture_data?id=' + this.id))
    ).subscribe(data => {
      this.display_data = data;
      this.display_data.picture = this.sanitizer.bypassSecurityTrustUrl(
          this.display_data.picture);
    });

    const pollTimer = timer(0, 1000).pipe(
      filter(ev => this.id !== ''),
      map(ev => this.id));

    merge(routeObs, pollTimer).pipe(
      switchMap(id => this.http.get<object[]>(
          '/get_continuations?id=' + this.id)),
      filter(data => data.length > 0),
      map(data => data[0]),
      take(1)).subscribe(entry => {
        if (entry['revealed']) {
          this.router.navigate(['reveal', entry['id']]);
	} else {
          this.router.navigate(['draw', entry['id']]);
	}
      });

    const idObs = merge(routeObs, this.galleryReloadSubject);
    idObs.pipe(
      switchMap(
        id => this.http.get<object[]>('/picture_galleries?id=' + this.id))
    ).subscribe(data => {
      this.galleries = data;
    });
  }

  add_to_gallery(code) {
    this.http.post(
      '/add_picture_to_gallery', {'code': code, 'picture_id': this.id}).subscribe(
      resp => this.galleryReloadSubject.next(this.id));
  }

  link_to_clipboard() {
    navigator.clipboard.writeText(this.cont_url).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }
}
