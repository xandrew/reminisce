import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FoldUserModule } from '../fold-user/fold-user.module';

@Component({
  selector: 'app-new-gallery',
  templateUrl: './new-gallery.component.html',
  styleUrls: ['./new-gallery.component.scss']
})
export class NewGalleryComponent {
  title = "";

  constructor(private fold_user: FoldUserModule, private router: Router) {
  }

  go() {
    this.fold_user.new_gallery(this.title);
    this.router.navigate(['/']);
  }
}
