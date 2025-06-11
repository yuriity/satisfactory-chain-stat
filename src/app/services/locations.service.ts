import { Injectable, signal } from '@angular/core';
import { LocationViewModel } from '../view-models/location-view-model';
import { Resource } from '../models/resource';

const RawQuartzResource = new Resource(
  'desc-rawquartz-c',
  'Raw Quartz',
  'Can be processed into Quartz Crystals and Silica, which both offer a variety of applications.'
);

const LimestoneResource = new Resource(
  'desc-stone-c',
  'Limestone',
  'Used for crafting. A basic resource primarily used for stable Foundations.'
);

const SilicaResource = new Resource(
  'desc-silica-c',
  'Silica',
  'Derived from Raw Quartz, Silica is a key component in electronics and construction materials.'
);

const CrudeOilResource = new Resource(
  'desc-liquidoil-c',
  'Crude Oil',
  'Refined into all kinds of Oil-based resources, like Fuel and Plastic.'
);

const PlasticResource = new Resource(
  'desc-plastic-c',
  'Plastic',
  'Versatile and easy to manufacture, Plastic is used in a wide range of products from packaging to electronics.'
);

const CircuitBoardResource = new Resource(
  'desc-circuitboard-c',
  'Circuit Board',
  'Advanced electronics component used in various devices, essential for modern technology.'
);

const Locations = [
  {
    id: 'silica-plant',
    name: 'Silica Plant',
    resourceSources: [],
    consumption: [
      { resource: RawQuartzResource, amount: 300 },
      { resource: LimestoneResource, amount: 100 },
    ],
    production: [{ resource: SilicaResource, amount: 200 }],
  },
  {
    id: 'plastic-plant',
    name: 'Plastic Plant',
    resourceSources: [],
    consumption: [{ resource: CrudeOilResource, amount: 500 }],
    production: [{ resource: PlasticResource, amount: 300 }],
  },
  {
    id: 'circuit-board-plant',
    name: 'Circuit Board Plant',
    resourceSources: ['silica-plant', 'plastic-plant'],
    consumption: [
      { resource: SilicaResource, amount: 240 },
      { resource: PlasticResource, amount: 140 },
    ],
    production: [{ resource: CircuitBoardResource, amount: 150 }],
  },
];

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private locationsSignal = signal<LocationViewModel[]>([
    new LocationViewModel(Locations[0]),
    new LocationViewModel(Locations[1]),
    new LocationViewModel(Locations[2]),
  ]);

  public readonly locations = this.locationsSignal.asReadonly();
}
