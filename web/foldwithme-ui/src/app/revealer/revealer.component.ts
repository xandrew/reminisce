import { Component, OnInit } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-revealer',
  templateUrl: './revealer.component.html',
  styleUrls: ['./revealer.component.scss']
})
export class RevealerComponent implements OnInit {

  constructor(
      private http: HttpClient,
      private sanitizer: DomSanitizer,
      private route: ActivatedRoute,
      private router: Router) { }

  private revealed: SafeUrl[] = [];
  private id: String;

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.id = params.get('id');
        this.revealed = [];
        return this.http.get<string[]>(
            '/reveal?last_id=' + this.id);
      })).subscribe(resp => {
        this.revealed = [];
        for (let url of resp) {
          this.revealed.push(this.sanitizer.bypassSecurityTrustUrl(url));
        }
      })
  }
}
