import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { Subject } from 'rxjs/index';

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
      private router: Router) { }

  id = '';
  galleries = [];
  display_data = undefined;
  galleryReloadSubject = new Subject<string>();

  ngOnInit() {
    const routeObs = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('id')));

    routeObs.subscribe(id => this.id = id);
    
    routeObs.pipe(
      switchMap(id => this.http.get('/picture_data?id=' + this.id))
    ).subscribe(data => {
      this.display_data = data;
      this.display_data.picture = this.sanitizer.bypassSecurityTrustUrl(
          this.display_data.picture);
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
}
