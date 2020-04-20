import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinGalleryComponent } from './join-gallery.component';

describe('JoinGalleryComponent', () => {
  let component: JoinGalleryComponent;
  let fixture: ComponentFixture<JoinGalleryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JoinGalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
