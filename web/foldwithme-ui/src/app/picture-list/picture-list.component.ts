import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { map, switchMap, filter, take } from 'rxjs/operators';
import { Subscription, BehaviorSubject, timer } from 'rxjs';

@Component({
  selector: 'app-picture-list',
  templateUrl: './picture-list.component.html',
  styleUrls: ['./picture-list.component.scss']
})
export class PictureListComponent implements OnInit {
  constructor(
      private http: HttpClient,
      private sanitizer: DomSanitizer) { }

  @Input() public set requestURL(value: string) {
    if (value !== this.requestURL) {
      this.requestURLSubject.next(value);
    }
  }

  public get requestURL(): string {
    return this.requestURLSubject.getValue();
  }

  @Input() gallery = '';
  @Input() refreshInterval = 5000;
  @Input() refreshCount = 100;
 
  private requestURLSubject = new BehaviorSubject<string>(undefined);

  pictures = [];
  private subs: Subscription[] = [];
  private refreshesLeft = this.refreshCount;

  canRefresh() {
    if (this.refreshesLeft > 0) {
      this.refreshesLeft -= 1;
      return true;
    }
    return false
  }

  restartRefreshing() {
    this.refreshesLeft = this.refreshCount;
  }

  ngOnInit() {
    const requestObs = this.requestURLSubject.pipe(
      filter(url => url !== undefined),
      switchMap(url => {
        this.restartRefreshing();
        return timer(0, this.refreshInterval).pipe(
            map(idx => url),
	    filter(url => this.canRefresh()));
      }),
      switchMap(url => {console.log(url); return this.http.get<object[]>(url)}));

    this.subs.push(requestObs.subscribe(data => {
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
}
