/**
 * A simple drawing canvas. Built on top of:
 * https://medium.com/@tarik.nzl/creating-a-canvas-component-with-free-hand-drawing-with-rxjs-and-angular-61279f577415
 */

import { Component, Input, ElementRef, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { of, fromEvent, merge } from 'rxjs';
import { map, switchMap, takeUntil, pairwise, filter } from 'rxjs/operators';
import { Location } from '@angular/common';
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
      private router: Router,
      private location: Location) { }

  @ViewChild('canvas', {static: false}) public canvas: ElementRef;

  @Input() public width = 400;
  @Input() public height = 400;

  private cx: CanvasRenderingContext2D;
  private parent = '';
  private prev_cropped: SafeUrl;
  private currentColor = 'black';
  private gallery: string;

  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    canvasEl.width = this.width;
    canvasEl.height = this.height;

    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.setColor('black');

    this.captureEvents(canvasEl);
  }
  
  private captureEvents(canvasEl: HTMLCanvasElement) {
    const enterWithButtonPressed = fromEvent(canvasEl, 'mouseenter').pipe(
      filter((e: MouseEvent) => (e.buttons & 1) !== 0));
    merge(fromEvent(canvasEl, 'mousedown'), enterWithButtonPressed)
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
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;

        const prevPos = {
          x: (res[0].clientX - rect.left) * scaleX,
          y: (res[0].clientY - rect.top) * scaleY
        };
  
        const currentPos = {
          x: (res[1].clientX - rect.left) * scaleX,
          y: (res[1].clientY - rect.top) * scaleY
        };
  
        this.drawOnCanvas(prevPos, currentPos);
      });

    fromEvent(canvasEl, 'touchstart')
    .pipe(
      switchMap((e) => {
        return fromEvent(canvasEl, 'touchmove')
          .pipe(
            takeUntil(fromEvent(canvasEl, 'touchend')),
            takeUntil(fromEvent(canvasEl, 'touchcancel')),
            pairwise() /* Return the previous and last values as array */
          )
      })
    ).subscribe((res: [TouchEvent, TouchEvent]) => {
        const rect = canvasEl.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;
  
        const prevPos = {
          x: (res[0].targetTouches[0].clientX - rect.left) * scaleX,
          y: (res[0].targetTouches[0].clientY - rect.top) * scaleY
        };
  
        const currentPos = {
          x: (res[1].targetTouches[0].clientX - rect.left) * scaleX,
          y: (res[1].targetTouches[0].clientY - rect.top) * scaleY
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

  setColor(color) {
    this.cx.strokeStyle = color;
    this.cx.lineWidth = 3;
    this.currentColor = color;
  }

  setEreaser() {
    this.cx.strokeStyle = 'white';
    this.cx.lineWidth = 18;
    this.currentColor = 'ereaser';
  }

  cropped_url_for_parent(parent) {
    return this.http.get('/continue?last_id=' + this.parent).pipe(
      map(resp => this.sanitizer.bypassSecurityTrustUrl(resp['cropped_url'])))
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        if (this.cx) {
	  this.cx.clearRect(0, 0, this.width, this.height);
	}
        this.parent = params.get('parent');
        this.prev_cropped = undefined;
	this.gallery = params.get('gallery');
	if (this.parent === '-') {
	  this.parent = '';
	  return of(undefined);
	} else {
	  return this.cropped_url_for_parent(this.parent);
	}
      })
    ).subscribe(cropped_url => this.prev_cropped = cropped_url);
  }

  post_image(reveal) {
    var image_url = this.canvas.nativeElement.toDataURL();
    return this.http.post(
        '/addFregment',
        {'parent': this.parent, 'image_url': image_url, 'revealed': reveal, 'gallery': this.gallery || ''});
  }

  done(reveal) {
    this.post_image(reveal).subscribe(resp => {
      const params = {}
      if (this.gallery) {
        params['gallery'] = this.gallery;
      }
      if (reveal) {
        this.router.navigate(['reveal', resp['id'], params]);
      } else {
        this.router.navigate(
	    ['picture', resp['id'], params]);
      }
    });
  }
}
