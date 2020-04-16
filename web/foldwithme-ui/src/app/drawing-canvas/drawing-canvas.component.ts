/**
 * A simple drawing canvas. Built on top of:
 * https://medium.com/@tarik.nzl/creating-a-canvas-component-with-free-hand-drawing-with-rxjs-and-angular-61279f577415
 */

import { Component, Input, ElementRef, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { map, switchMap, takeUntil, pairwise } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-drawing-canvas',
  templateUrl: './drawing-canvas.component.html',
  styleUrls: ['./drawing-canvas.component.scss']
})
export class DrawingCanvasComponent implements AfterViewInit, OnInit {

  constructor(
      private http: HttpClient,
      private sanitizer: DomSanitizer,
      private route: ActivatedRoute,
      private router: Router) { }

  @ViewChild('canvas', {static: false}) public canvas: ElementRef;

  @Input() public width = 400;
  @Input() public height = 400;

  private cx: CanvasRenderingContext2D;
  private parent = '';
  private prev_cropped: SafeUrl;

  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    canvasEl.width = this.width;
    canvasEl.height = this.height;

    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';

    this.captureEvents(canvasEl);
  }
  
  private captureEvents(canvasEl: HTMLCanvasElement) {
    fromEvent(canvasEl, 'mousedown')
    .pipe(
      switchMap((e) => {
        return fromEvent(canvasEl, 'mousemove')
          .pipe(
            takeUntil(fromEvent(canvasEl, 'mouseup')),
            takeUntil(fromEvent(canvasEl, 'mouseleave')),
            pairwise() /* Return the previous and last values as array */
          )
      })
    ).subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();
  
        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top
        };
  
        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };
  
        this.drawOnCanvas(prevPos, currentPos);
      });
  }

  private drawOnCanvas(prevPos: { x: number, y: number }, currentPos: { x: number, y: number }) {
    if (!this.cx) { return; }

    this.cx.beginPath();

    if (prevPos) {
      this.cx.moveTo(prevPos.x, prevPos.y); // from
      this.cx.lineTo(currentPos.x, currentPos.y);
      this.cx.stroke();
    }
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        if (this.cx) {
	  this.cx.clearRect(0, 0, this.width, this.height);
	}
        this.parent = params.get('parent');
        this.prev_cropped = '';
        return this.http.get(
            '/continue?last_id=' + this.parent);
      }),
      map(resp => this.sanitizer.bypassSecurityTrustUrl(resp['cropped_url']))
    ).subscribe(cropped_url => {this.prev_cropped = cropped_url; console.log(this.prev_cropped);});
  }

  post_image() {
    var image_url = this.canvas.nativeElement.toDataURL();
    return this.http.post(
        '/addFregment',
        {'parent': this.parent, 'image_url': image_url});
  }

continue() {
    this.post_image().subscribe(resp =>
      this.router.navigate(['draw', resp['id']]));
  }

  reveal() {
    this.post_image().subscribe(resp =>
      this.router.navigate(['reveal', resp['id']]));
  }
}
