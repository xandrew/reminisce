import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FoldUserModule } from '../fold-user/fold-user.module';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

  constructor(
      private fold_user: FoldUserModule,
      private http: HttpClient,
      private sanitizer: DomSanitizer,
      private route: ActivatedRoute,
      private router: Router) { }

  code = "";
  pictures = [];

  ngOnInit() {
    const routeObs = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('code')));

    routeObs.subscribe(code => this.code = code);

    routeObs.pipe(
      switchMap(id => this.http.get<object[]>('/gallery_contents?code=' + this.code))
    ).subscribe(data => {
      console.log(data);
      this.pictures = data;
      for (var entry of this.pictures) {
        entry.picture = this.sanitizer.bypassSecurityTrustUrl(entry.picture);
      }
    });
  }
}
