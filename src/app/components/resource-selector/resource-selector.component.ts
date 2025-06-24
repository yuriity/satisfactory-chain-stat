import {
  Component,
  inject,
  signal,
  output,
  input,
  effect,
  computed,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDropdown, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ResourcesService } from '../../services/resources.service';
import { Resource } from '../../models/resource';
import { debounce } from '../../utils/debounce';

@Component({
  selector: 'scs-resource-selector',
  imports: [CommonModule, FormsModule, NgbDropdownModule],
  templateUrl: './resource-selector.component.html',
  styleUrl: './resource-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceSelectorComponent {
  // Input signals
  placeholder = input<string>('Search resources...');
  selectedResourceInput = input<Resource | null>(null);

  // Output signals
  resourceSelected = output<Resource | null>();

  // ViewChild for dropdown control
  @ViewChild(NgbDropdown, { static: false }) dropdown!: NgbDropdown;
  @ViewChild('dropdownMenu', { static: false })
  dropdownMenu!: ElementRef<HTMLElement>;
  @ViewChild('searchInput', { static: false })
  searchInput!: ElementRef<HTMLInputElement>;

  // Protected signals for component state
  protected searchTerm = signal('');
  protected selectedResource = signal<Resource | null>(null);
  protected filteredResources = signal<Resource[]>([]);
  protected activeIndex = signal(-1);

  // Computed signals
  protected isSearching = computed(() => {
    const resource = this.selectedResource();
    const term = this.searchTerm();

    if (!resource) return term.length > 0;
    return term !== resource.displayName && term.length > 0;
  });

  protected showDropdown = computed(() => {
    // In testing environments, dropdown.isOpen() might not work reliably
    // So we also check if filteredResources are available and search input has focus
    return this.dropdown?.isOpen() || this.filteredResources().length > 0;
  });

  // Dependency injection
  private readonly resourcesService = inject(ResourcesService);

  // Private properties
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

    // Initialize filtered resources
    this.updateFilteredResources();
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
  }

  /**
   * Clears only the search text without changing the selection
   */
  clearSearchText(): void {
    if (this.selectedResource()) {
      this.searchTerm.set(this.selectedResource()!.displayName);
    } else {
      this.searchTerm.set('');
      this.updateFilteredResources();
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
    // Reset active index when filtered resources change
    this.activeIndex.set(-1);
  }

  /**
   * Toggles the dropdown open/closed state
   */
  protected toggleDropdown(): void {
    if (this.dropdown.isOpen()) {
      this.dropdown.close();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Opens the dropdown and clears search input to show all resources
   */
  protected openDropdown(): void {
    // Clear search input and show all resources
    this.searchTerm.set('');
    this.updateFilteredResources();

    // Set active index to the currently selected resource position
    const selectedResource = this.selectedResource();
    if (selectedResource) {
      const resources = this.filteredResources();
      const selectedIndex = resources.findIndex(
        (r) => r.className === selectedResource.className
      );
      this.activeIndex.set(selectedIndex >= 0 ? selectedIndex : -1);
    } else {
      this.activeIndex.set(-1);
    }

    this.dropdown.open();

    // Focus the search input and scroll to selected item after dropdown opens
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.nativeElement.focus();
      }
      this.scrollToSelectedItem();
    }, 0);
  }

  /**
   * Handles dropdown close events - restore selected resource name if no change
   */
  protected onDropdownClose(): void {
    // Always restore the selected resource name when dropdown closes
    // This ensures the input shows the current selection after closing
    if (this.selectedResource()) {
      this.searchTerm.set(this.selectedResource()!.displayName);
    } else {
      this.searchTerm.set('');
    }
  }

  /**
   * Handles dropdown open/close state changes
   */
  protected onDropdownOpenChange(isOpen: boolean): void {
    if (!isOpen) {
      this.onDropdownClose();
      this.activeIndex.set(-1); // Reset active index when dropdown closes
    }
  }

  /**
   * Handle keyboard events for accessibility
   * @param event The keyboard event
   */
  protected onKeyDown(event: KeyboardEvent): void {
    const resources = this.filteredResources();

    // Only handle keyboard events if we have resources to navigate
    if (resources.length === 0) return;

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
          this.dropdown.close();
          if (event.target) {
            (event.target as HTMLElement).blur();
          }
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.dropdown.close();
        if (event.target) {
          (event.target as HTMLElement).blur();
        }
        break;
    }
  }

  /**
   * Scrolls to the selected item in the dropdown menu
   */
  private scrollToSelectedItem(): void {
    const selectedResource = this.selectedResource();
    if (!selectedResource || !this.dropdownMenu) {
      return;
    }

    const menuElement = this.dropdownMenu.nativeElement;
    const selectedItem = menuElement.querySelector(
      `[data-resource-id="${selectedResource.className}"]`
    ) as HTMLElement;

    if (selectedItem) {
      // Calculate the position to scroll to center the selected item
      const menuHeight = menuElement.clientHeight;
      const itemHeight = selectedItem.offsetHeight;
      const itemTop = selectedItem.offsetTop;
      const scrollTop = itemTop - menuHeight / 2 + itemHeight / 2;

      menuElement.scrollTop = Math.max(0, scrollTop);
    }
  }
}
