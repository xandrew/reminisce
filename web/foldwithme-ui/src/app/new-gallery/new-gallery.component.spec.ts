import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewGalleryComponent } from './new-gallery.component';

describe('NewGalleryComponent', () => {
  let component: NewGalleryComponent;
  let fixture: ComponentFixture<NewGalleryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewGalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
