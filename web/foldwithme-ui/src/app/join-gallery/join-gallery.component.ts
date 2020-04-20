import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FoldUserModule } from '../fold-user/fold-user.module';

@Component({
  selector: 'app-join-gallery',
  templateUrl: './join-gallery.component.html',
  styleUrls: ['./join-gallery.component.scss']
})
export class JoinGalleryComponent {
  code = "";

  constructor(private fold_user: FoldUserModule, private router: Router) {
  }

  go() {
    this.fold_user.join_gallery(this.code);
    this.router.navigate(['/']);
  }
}
