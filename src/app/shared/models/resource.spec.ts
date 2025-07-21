import { Resource, getSmallIconUrl, getLargeIconUrl } from './resource';

describe('Resource Model', () => {
  it('should generate correct small icon URL', () => {
    const resource: Resource = {
      className: 'desc-ironore-c',
      displayName: 'Iron Ore',
      description: 'Description',
      stackSize: 'SS_MEDIUM',
      sinkPoints: 2,
    };

    expect(getSmallIconUrl(resource)).toBe(
      'https://www.satisfactorytools.com/assets/images/items/desc-ironore-c_64.png'
    );
  });

  it('should generate correct large icon URL', () => {
    const resource: Resource = {
      className: 'desc-ironore-c',
      displayName: 'Iron Ore',
      description: 'Description',
      stackSize: 'SS_MEDIUM',
      sinkPoints: 2,
    };

    expect(getLargeIconUrl(resource)).toBe(
      'https://www.satisfactorytools.com/assets/images/items/desc-ironore-c_256.png'
    );
  });
});
