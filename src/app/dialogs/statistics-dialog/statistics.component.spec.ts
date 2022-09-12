import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsDialogComponent } from './statistics.component';

describe('StatisticsComponent', () => {
  let component: StatisticsDialogComponent;
  let fixture: ComponentFixture<StatisticsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatisticsDialogComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(StatisticsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
