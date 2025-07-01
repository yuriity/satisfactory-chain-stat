export interface Resource {
  readonly className: string;
  readonly displayName: string;
  readonly description: string;
}

export function getSmallIconUrl(resource: Resource): string {
  return `https://www.satisfactorytools.com/assets/images/items/${resource.className}_64.png`;
}

export function getLargeIconUrl(resource: Resource): string {
  return `https://www.satisfactorytools.com/assets/images/items/${resource.className}_256.png`;
}
