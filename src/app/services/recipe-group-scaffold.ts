import { RecipeGroup } from '../models/recipe';

export interface GroupScaffold {
  name: string;
  bgHexColor: string;
  products: string[];
}

export const RecipeGroupScaffold: GroupScaffold[] = [
  {
    name: 'Iron',
    bgHexColor: '#BFBFBF',
    products: [
      'desc-ironingot-c',
      'desc-ironplate-c',
      'desc-ironrod-c',
      'desc-ironscrew-c',
      'desc-ironplatereinforced-c',
    ],
  },
  {
    name: 'Copper',
    bgHexColor: '#FDE3D6',
    products: [
      'desc-copperingot-c',
      'desc-coppersheet-c',
      'desc-wire-c',
      'desc-cable-c',
      'desc-copperdust-c',
    ],
  },
  {
    name: 'Quartz',
    bgHexColor: '#FECCFF',
    products: ['desc-quartzcrystal-c', 'desc-silica-c'],
  },
];
