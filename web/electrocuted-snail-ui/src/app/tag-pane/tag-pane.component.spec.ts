import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagPaneComponent } from './tag-pane.component';

describe('TagPaneComponent', () => {
  let component: TagPaneComponent;
  let fixture: ComponentFixture<TagPaneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagPaneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
