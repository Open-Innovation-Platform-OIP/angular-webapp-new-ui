import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrichmentDetailModalComponent } from './enrichment-detail-modal.component';

describe('EnrichmentDetailModalComponent', () => {
  let component: EnrichmentDetailModalComponent;
  let fixture: ComponentFixture<EnrichmentDetailModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnrichmentDetailModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrichmentDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
