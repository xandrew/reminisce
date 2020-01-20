import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent implements OnInit {
  constructor() { }

  @Output() selected = new EventEmitter();
  @Output() file = new EventEmitter<File>();
  @Output() remove = new EventEmitter();
  @Input() id;

  handleFileInput(files: FileList) {
    var file = files.item(0);
    this.fileName = file.name;
    if (file.name) {
      this.selected.emit();
      this.file.emit(file);
    }
  }

  onRemove() {
    this.remove.emit();
  }

  ngOnInit() {
  }
}
