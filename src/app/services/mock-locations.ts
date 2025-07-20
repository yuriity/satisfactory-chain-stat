import { Resource } from '../models/resource';
import { Location } from '../models/location';

export const RawQuartzResource: Resource = {
  className: 'desc-rawquartz-c',
  displayName: 'Raw Quartz',
  description:
    'Can be processed into Quartz Crystals and Silica, which both offer a variety of applications.',
  stackSize: 'SS_MEDIUM',
  sinkPoints: 15,
};

export const LimestoneResource: Resource = {
  className: 'desc-stone-c',
  displayName: 'Limestone',
  description:
    'Used for crafting. A basic resource primarily used for stable Foundations.',
  stackSize: 'SS_MEDIUM',
  sinkPoints: 2,
};

export const SilicaResource: Resource = {
  className: 'desc-silica-c',
  displayName: 'Silica',
  description:
    'Derived from Raw Quartz, Silica is a key component in electronics and construction materials.',
  stackSize: 'SS_BIG',
  sinkPoints: 20,
};

export const CrudeOilResource: Resource = {
  className: 'desc-liquidoil-c',
  displayName: 'Crude Oil',
  description:
    'Refined into all kinds of Oil-based resources, like Fuel and Plastic.',
  stackSize: 'SS_FLUID',
  sinkPoints: 30,
};

export const PlasticResource: Resource = {
  className: 'desc-plastic-c',
  displayName: 'Plastic',
  description:
    'Versatile and easy to manufacture, Plastic is used in a wide range of products from packaging to electronics.',
  stackSize: 'SS_BIG',
  sinkPoints: 75,
};

export const CircuitBoardResource: Resource = {
  className: 'desc-circuitboard-c',
  displayName: 'Circuit Board',
  description:
    'Advanced electronics component used in various devices, essential for modern technology.',
  stackSize: 'SS_BIG',
  sinkPoints: 696,
};

export const LOCATIONS: Location[] = [
  {
    id: 'silica-plant-1',
    name: 'Silica Plant',
    cardPositionX: 15,
    cardPositionY: 15,
    resourceSources: [],
    consumption: [
      { resource: RawQuartzResource, amount: 300 },
      { resource: LimestoneResource, amount: 100 },
    ],
    production: [{ resource: SilicaResource, amount: 200, consumption: 0 }],
  },
  {
    id: 'plastic-plant-1',
    name: 'Plastic Plant',
    cardPositionX: 15,
    cardPositionY: 415,
    resourceSources: [],
    consumption: [{ resource: CrudeOilResource, amount: 500 }],
    production: [{ resource: PlasticResource, amount: 300, consumption: 0 }],
  },
  {
    id: 'circuit-board-plant1',
    name: 'Circuit Board Plant',
    cardPositionX: 740,
    cardPositionY: 160,
    resourceSources: ['silica-plant-1', 'plastic-plant-1'],
    consumption: [
      { resource: SilicaResource, amount: 240 },
      { resource: PlasticResource, amount: 140 },
    ],
    production: [
      { resource: CircuitBoardResource, amount: 150, consumption: 0 },
    ],
  },
];
