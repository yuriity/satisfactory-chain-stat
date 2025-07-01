import { Resource, getSmallIconUrl, getLargeIconUrl } from './resource';

describe('Resource Model', () => {
  it('should create a resource with provided values', () => {
    const className = 'desc-ironore-c';
    const displayName = 'Iron Ore';
    const description = 'Basic building material';

    const resource: Resource = { className, displayName, description };

    expect(resource.className).toBe(className);
    expect(resource.displayName).toBe(displayName);
    expect(resource.description).toBe(description);
  });

  it('should generate correct small icon URL', () => {
    const resource: Resource = {
      className: 'desc-ironore-c',
      displayName: 'Iron Ore',
      description: 'Description',
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
    };

    expect(getLargeIconUrl(resource)).toBe(
      'https://www.satisfactorytools.com/assets/images/items/desc-ironore-c_256.png'
    );
  });
});
