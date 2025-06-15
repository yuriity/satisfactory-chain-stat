import {
  Component,
  inject,
  signal,
  Output,
  EventEmitter,
  input,
  effect,
  computed,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResourcesService } from '../../services/resources.service';
import { Resource } from '../../models/resource';
import { debounce } from '../../utils/debounce';

@Component({
  selector: 'scs-resource-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resource-selector.component.html',
  styleUrl: './resource-selector.component.scss',
})
export class ResourceSelectorComponent implements OnDestroy {
  placeholder = input<string>('Search resources...');
  selectedResourceInput = input<Resource | null>(null);

  @Output() resourceSelected = new EventEmitter<Resource | null>();

  protected searchTerm = signal('');
  protected showDropdown = signal(false);
  protected filteredResources = signal<Resource[]>([]);
  protected selectedResource = signal<Resource | null>(null);
  protected activeIndex = signal(-1); // Track active index for keyboard navigation

  protected isSearching = computed(() => {
    const resource = this.selectedResource();
    const term = this.searchTerm();

    if (!resource) return term.length > 0;
    return term !== resource.displayName && term.length > 0;
  });

  private readonly resourcesService = inject(ResourcesService);

  private hideDropdownTimeout?: number;
  private debouncedUpdateFilteredResources: () => void;

  constructor() {
    // React to changes to the selectedResourceInput using effect
    effect(() => {
      const resource = this.selectedResourceInput();
      this.selectedResource.set(resource);
      if (resource) {
        this.searchTerm.set(resource.displayName);
      } else {
        this.searchTerm.set('');
      }
    });

    // Create debounced version of updateFilteredResources
    this.debouncedUpdateFilteredResources = debounce(
      this.updateFilteredResources.bind(this),
      300
    );
  }

  /**
   * Clean up resources when the component is destroyed
   */
  ngOnDestroy(): void {
    // Clean up any pending timeout
    if (this.hideDropdownTimeout) {
      window.clearTimeout(this.hideDropdownTimeout);
      this.hideDropdownTimeout = undefined;
    }
  }

  /**
   * Toggles the visibility of the dropdown menu
   */
  toggleDropdown(): void {
    this.showDropdown.update((current) => !current);
    if (this.showDropdown()) {
      this.updateFilteredResources();
    }
  }

  /**
   * Clears the current resource selection and emits null
   */
  clearSelection(): void {
    this.selectedResource.set(null);
    this.searchTerm.set('');
    this.resourceSelected.emit(null);
  }

  /**
   * Selects a resource, updates the UI state, and emits the selection event
   * @param resource The resource selected by the user
   */
  protected selectResource(resource: Resource): void {
    this.selectedResource.set(resource);
    this.resourceSelected.emit(resource);
    this.searchTerm.set(resource.displayName);
    this.showDropdown.set(false);
  }

  /**
   * Hides the dropdown menu after a short delay
   */
  protected hideDropdown(): void {
    // Clear any existing timeout
    if (this.hideDropdownTimeout) {
      window.clearTimeout(this.hideDropdownTimeout);
      this.hideDropdownTimeout = undefined;
    }

    // Set new timeout
    this.hideDropdownTimeout = window.setTimeout(() => {
      this.showDropdown.set(false);
      // Reset search term based on selection status
      if (this.selectedResource()) {
        // If a resource is selected, restore its name
        this.searchTerm.set(this.selectedResource()!.displayName);
      } else {
        // If no resource is selected, clear the search term
        this.searchTerm.set('');
      }
      this.hideDropdownTimeout = undefined;
    }, 200);
  }

  /**
   * Handles search input changes by updating search term and filtering resources
   * @param event The input event from the search field
   */
  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.searchTerm.set(value);
    this.debouncedUpdateFilteredResources();
    this.showDropdown.set(true);
  }

  /**
   * Clears only the search text without changing the selection
   */
  protected clearSearchText(): void {
    if (this.selectedResource()) {
      this.searchTerm.set(this.selectedResource()!.displayName);
    } else {
      this.searchTerm.set('');
      this.showDropdown.set(true);
      this.updateFilteredResources();
    }
  }

  /**
   * Closes the dropdown menu immediately
   */
  protected closeDropdown(): void {
    this.showDropdown.set(false);
  }

  /**
   * Handle keyboard events for accessibility
   * @param event The keyboard event
   */
  protected onKeyDown(event: KeyboardEvent): void {
    if (!this.showDropdown()) return;

    const resources = this.filteredResources();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update((idx) =>
          Math.min(idx + 1, resources.length - 1)
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update((idx) => Math.max(idx - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex() >= 0 && this.activeIndex() < resources.length) {
          this.selectResource(resources[this.activeIndex()]);
          if (event.target) {
            (event.target as HTMLElement).blur();
          }
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.closeDropdown();
        break;
    }
  }

  /**
   * Updates the filtered resources list based on the current search term
   */
  private updateFilteredResources(): void {
    const term = this.searchTerm();
    if (term.trim() === '') {
      // Show all resources when the search field is empty
      this.filteredResources.set(this.resourcesService.resources());
    } else {
      // Show filtered resources when there's a search term
      this.filteredResources.set(
        this.resourcesService.findResourcesByName(term)
      );
    }
  }
}
