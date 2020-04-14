/**
 * A simple drawing canvas. Built on top of:
 * https://medium.com/@tarik.nzl/creating-a-canvas-component-with-free-hand-drawing-with-rxjs-and-angular-61279f577415
 */

import { Component, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-drawing-canvas',
  templateUrl: './drawing-canvas.component.html',
  styleUrls: ['./drawing-canvas.component.scss']
})
export class DrawingCanvasComponent implements AfterViewInit {

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  @ViewChild('canvas', {static: false}) public canvas: ElementRef;

  @Input() public width = 400;
  @Input() public height = 400;

  private cx: CanvasRenderingContext2D;
  private parent = '';
  private prev_cropped: SafeUrl;
  private revealed: SafeUrl[] = [];

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

  continue() {
    var image_url = this.canvas.nativeElement.toDataURL();
    this.http.post(
        '/addFregment',
	{'parent': this.parent, 'image_url': image_url}).subscribe(resp => {
      this.parent = resp['id'];
      this.http.get(
          '/continue?last_id=' + this.parent).subscribe(resp2 => {
        console.log(resp2);
        this.prev_cropped = this.sanitizer.bypassSecurityTrustUrl(resp2['cropped_url']);
      });
    });
    this.cx.clearRect(0, 0, this.width, this.height);
  }

  reveal() {
    var image_url = this.canvas.nativeElement.toDataURL();
    this.http.post(
        '/addFregment',
	{'parent': this.parent, 'image_url': image_url}).subscribe(resp => {
      var id = resp['id'];
      this.http.get<string[]>(
          '/reveal?last_id=' + id).subscribe(resp => {
        this.revealed = [];
        for (let url of resp) {
          this.revealed.push(this.sanitizer.bypassSecurityTrustUrl(url));
        }
        console.log(this.revealed);
      });
    });
  }
}
