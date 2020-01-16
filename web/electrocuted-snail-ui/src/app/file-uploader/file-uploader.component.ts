import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent implements OnInit {
  constructor() { }

  @Output() selected = new EventEmitter();
  @Output() remove = new EventEmitter();
  @Input() id;

  handleFileInput(files: FileList) {
    this.fileName = files.item(0).name;
    if (this.fileName) {
      this.selected.emit();
    }
  }

  onRemove() {
    this.remove.emit(this.id);
  }

  ngOnInit() {
  }
}
