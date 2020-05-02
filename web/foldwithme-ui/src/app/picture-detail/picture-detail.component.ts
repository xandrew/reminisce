import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { map, switchMap, filter, take } from 'rxjs/operators';
import { merge, Subscription } from 'rxjs';
import { Subject, timer } from 'rxjs/index';

import { FoldUserModule } from '../fold-user/fold-user.module';

@Component({
  selector: 'app-picture-detail',
  templateUrl: './picture-detail.component.html',
  styleUrls: ['./picture-detail.component.scss']
})
export class PictureDetailComponent implements OnInit, OnDestroy {

  constructor(
      private fold_user: FoldUserModule,
      private http: HttpClient,
      private sanitizer: DomSanitizer,
      private route: ActivatedRoute,
      private router: Router,
      private location: Location) { }

  id = '';
  galleries = [];
  galleryReloadSubject = new Subject<string>();
  cont_url = '';
  mailto = '';
  gallery = '';

  private subs: Subscription[] = [];

  routeArrayFor(operation, id) {
    const res = [operation, id];
    if (this.gallery) {
      res.push({'gallery': this.gallery});
    }
    return res;
  }

  ngOnInit() {
    this.subs.push(this.route.paramMap.subscribe((params: ParamMap) => {
      this.id = params.get('id');
      this.gallery = params.get('gallery');
      this.cont_url = (
          location.origin +
	  '/' +
	  this.location.prepareExternalUrl(
              this.router.createUrlTree(
	          this.routeArrayFor('draw', this.id)).toString()));
      this.mailto = encodeURI(
          'mailto:?subject=Continue my drawing!&body=Just follow this URL:\n' +
	  this.cont_url);
    }));
    
    const routeObs = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('id')));

    /* No gallery selection for now.
    const idObs = merge(routeObs, this.galleryReloadSubject);
    this.subs.push(idObs.pipe(
      filter(id => {console.log(this.fold_user.email); return (this.fold_user.email !== '')}),
      switchMap(
        id => this.http.get<object[]>('/picture_galleries?id=' + this.id))
    ).subscribe(data => {
      console.log(this.galleries);
      this.galleries = data;
    }));*/
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
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
