import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductionRecord } from '../../../models/location';

@Component({
  selector: 'scs-prodaction-statistics',
  imports: [CommonModule],
  templateUrl: './prodaction-statistics.component.html',
  styleUrls: ['./prodaction-statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProdactionStatisticsComponent {
  // Required input
  productionRecord = input.required<ProductionRecord>();

  // Computed values for visualization
  protected productionPercentage = computed(() => {
    const record = this.productionRecord();
    const total = Math.max(record.amount, record.consumption);

    if (total === 0) return 0;
    return (record.amount / total) * 100;
  });

  protected consumptionPercentage = computed(() => {
    const record = this.productionRecord();
    const total = Math.max(record.amount, record.consumption);

    if (total === 0) return 0;
    return (record.consumption / total) * 100;
  });

  protected barState = computed(() => {
    const record = this.productionRecord();

    if (record.consumption === 0 && record.amount > 0) {
      return 'production-only';
    } else if (record.amount === 0 && record.consumption > 0) {
      return 'consumption-only';
    } else {
      return 'balanced';
    }
  });

  protected displayProduction = computed(() => {
    const amount = this.productionRecord().amount;
    return `${amount}/min`;
  });

  protected displayConsumption = computed(() => {
    const consumption = this.productionRecord().consumption;
    return `${consumption}/min`;
  });

  protected isShortage = computed(
    () => this.productionRecord().consumption > this.productionRecord().amount
  );
}
