import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resource } from '../models/resource';

@Injectable({
  providedIn: 'root',
})
export class ResourcesService {
  private resourcesDataSource = '/data/en-US_extracted.json';
  private resourcesSignal = signal<Resource[]>([]);
  private isLoading = signal(false);
  private error = signal<Error | null>(null);

  public readonly resources = this.resourcesSignal.asReadonly();
  public readonly loading = this.isLoading.asReadonly();
  public readonly loadError = this.error.asReadonly();

  constructor(private http: HttpClient) {
    // Load resources immediately at startup
    this.loadResources();
  }

  /**
   * Manually triggers a reload of resources if needed
   */
  reloadResources(): void {
    this.loadResources();
  }

  /**
   * Returns a resource by its className
   * @param className The class name of the resource to find
   * @returns The resource object or undefined if not found
   */
  getResourceByClassName(className: string): Resource | undefined {
    return this.resourcesSignal().find(
      (resource) => resource.className === className
    );
  }

  /**
   * Returns resources matching the provided name (case-insensitive partial match)
   * @param resourceName The name to search for
   * @returns Array of matching resource objects
   */
  findResourcesByName(resourceName: string): Resource[] {
    if (!resourceName || resourceName.trim() === '') {
      return [];
    }

    const searchTerm = resourceName.toLowerCase().trim();
    return this.resourcesSignal().filter((resource) =>
      resource.displayName?.toLowerCase().includes(searchTerm)
    );
  }

  private loadResources(): void {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<any[]>(this.resourcesDataSource).subscribe({
      next: (data) => {
        const resources = data.map(
          (item) =>
            new Resource(item.className, item.displayName, item.description)
        );
        this.resourcesSignal.set(resources);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load resources:', err);
        this.error.set(err);
        this.isLoading.set(false);
      },
    });
  }
}
