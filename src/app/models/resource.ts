export class Resource {
  readonly className: string;
  readonly displayName: string;
  readonly description: string;

  constructor(className: string, displayName: string, description: string) {
    this.className = className;
    this.displayName = displayName;
    this.description = description;
  }

  getSmallIconUrl(): string {
    return `https://www.satisfactorytools.com/assets/images/items/${this.className}_64.png`;
  }

  getLargeIconUrl(): string {
    return `https://www.satisfactorytools.com/assets/images/items/${this.className}_256.png`;
  }
}
