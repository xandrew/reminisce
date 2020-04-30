import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FoldUserModule } from '../fold-user/fold-user.module';
import { map, switchMap, filter, take } from 'rxjs/operators';
import { timer } from 'rxjs/index';
import { merge, Subscription } from 'rxjs';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, OnDestroy {

  constructor(
      private fold_user: FoldUserModule,
      private http: HttpClient,
      private sanitizer: DomSanitizer,
      private route: ActivatedRoute,
      private router: Router) { }

  code = "";
  pictures = [];
  private subs: Subscription[] = [];

  ngOnInit() {
    const routeObs = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('code')));

    this.subs.push(routeObs.subscribe(code => this.code = code));

    const pollTimer = timer(0, 5000).pipe(
      filter(ev => this.code !== ''),
      map(ev => this.code),
      take(100));

    this.subs.push(merge(routeObs, pollTimer).pipe(
      switchMap(id => this.http.get<object[]>('/gallery_contents?code=' + this.code))
    ).subscribe(data => {
      console.log(data);
      this.pictures = data;
      for (var entry of this.pictures) {
        entry.picture = this.sanitizer.bypassSecurityTrustUrl(entry.picture);
      }
    }));
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  startDrawing() {
    this.router.navigate(['draw', '-', {'gallery': this.code}]);
  }
}
