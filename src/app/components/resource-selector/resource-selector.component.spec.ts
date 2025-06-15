import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { By } from '@angular/platform-browser';

import { ResourceSelectorComponent } from './resource-selector.component';
import { ResourcesService } from '../../services/resources.service';
import { Resource } from '../../models/resource';

describe('ResourceSelectorComponent', () => {
  let component: ResourceSelectorComponent;
  let fixture: ComponentFixture<ResourceSelectorComponent>;
  let mockResourcesService: jasmine.SpyObj<ResourcesService>;

  // Mock resources for testing
  const mockResources: Resource[] = [
    new Resource(
      'Desc_IronOre_C',
      'Iron Ore',
      'Raw material for iron production.'
    ),
    new Resource(
      'Desc_CopperOre_C',
      'Copper Ore',
      'Raw material for copper production.'
    ),
    new Resource('Desc_Coal_C', 'Coal', 'Raw material for steel production.'),
  ];

  beforeEach(async () => {
    // Create a mock ResourcesService
    mockResourcesService = jasmine.createSpyObj(
      'ResourcesService',
      ['findResourcesByName'],
      {
        // Mock the read-only resources signal
        resources: jasmine
          .createSpy('resources')
          .and.returnValue(mockResources),
      }
    );

    // Configure the findResourcesByName spy
    mockResourcesService.findResourcesByName.and.callFake((term: string) => {
      return mockResources.filter((r) =>
        r.displayName.toLowerCase().includes(term.toLowerCase())
      );
    });

    await TestBed.configureTestingModule({
      imports: [ResourceSelectorComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ResourcesService, useValue: mockResourcesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show default placeholder in input field', () => {
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.placeholder).toBe('Search resources...');
  });

  it('should show custom placeholder when provided', () => {
    fixture.componentRef.setInput('placeholder', 'Custom placeholder');
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.placeholder).toBe('Custom placeholder');
  });

  it('should select and display a resource when clicked', () => {
    // First show the dropdown
    component.toggleDropdown();
    fixture.detectChanges();

    // Check that dropdown is visible
    const dropdown = fixture.debugElement.query(By.css('.dropdown-menu.show'));
    expect(dropdown)
      .withContext('Dropdown should be visible before selection')
      .toBeTruthy();

    // Find and click the first resource item
    const resourceItem = fixture.debugElement.query(By.css('.resource-item'));
    resourceItem.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Check that the input field shows the resource name
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.value)
      .withContext('Input should display the selected resource name')
      .toBe(mockResources[0].displayName);

    // Verify the resource image appears in the UI
    const imgContainer = fixture.debugElement.query(
      By.css('.input-group-prepend')
    );
    expect(imgContainer)
      .withContext('Resource image container should be present')
      .toBeTruthy();
  });

  it('should respond to selectedResourceInput changes', () => {
    // Create a completely new component
    const newFixture = TestBed.createComponent(ResourceSelectorComponent);

    // Set the selected resource input
    newFixture.componentRef.setInput('selectedResourceInput', mockResources[0]);

    // Run change detection to process input
    newFixture.detectChanges();

    // Check if the searchTerm was set correctly
    const input = newFixture.debugElement.query(By.css('input'));
    expect(input).withContext('Input field should exist').toBeTruthy();
    expect(input.nativeElement.value).toBe(mockResources[0].displayName);

    // Change the selected resource and verify it updates
    newFixture.componentRef.setInput('selectedResourceInput', mockResources[1]);
    newFixture.detectChanges();

    // Check that the input value is updated
    expect(input.nativeElement.value).toBe(mockResources[1].displayName);
  });

  it('should clear input field when selectedResourceInput is set to null', () => {
    // First set a resource
    const newFixture = TestBed.createComponent(ResourceSelectorComponent);
    newFixture.componentRef.setInput('selectedResourceInput', mockResources[0]);
    newFixture.detectChanges();

    const input = newFixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.value).toBe(mockResources[0].displayName);

    // Then clear it by setting null
    newFixture.componentRef.setInput('selectedResourceInput', null);
    newFixture.detectChanges();

    // Check that the input value is cleared
    expect(input.nativeElement.value).toBe('');
  });

  it('should filter resources on search input', (done) => {
    // Simulate typing in search field
    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    inputEl.value = 'iron';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Since we're now using debounce, need to wait for the debounce to complete
    setTimeout(() => {
      // Verify service was called correctly
      expect(mockResourcesService.findResourcesByName).toHaveBeenCalledWith(
        'iron'
      );
      done();
    }, 350); // Wait slightly longer than the debounce delay

    // Verify dropdown is shown and contains filtered items
    const dropdownEl = fixture.debugElement.query(
      By.css('.dropdown-menu.show')
    );
    expect(dropdownEl).toBeTruthy();
  });

  it('should select resource when clicked', () => {
    // Set up spy for output event
    const outputSpy = jasmine.createSpy('resourceSelectedSpy');
    component.resourceSelected.subscribe(outputSpy);

    // Show dropdown
    component.toggleDropdown();
    fixture.detectChanges();

    // Click on a resource item
    const firstResource = fixture.debugElement.query(By.css('.resource-item'));
    firstResource.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Verify output was emitted
    expect(outputSpy).toHaveBeenCalledWith(mockResources[0]);

    // Verify input field shows selected resource name
    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.value).toBe(mockResources[0].displayName);

    // Verify image is displayed
    const img = fixture.debugElement.query(By.css('.input-group-prepend img'));
    expect(img).toBeTruthy();
  });

  it('should clear selection', () => {
    // First select a resource via the UI
    component.toggleDropdown();
    fixture.detectChanges();

    // Find and click the first resource item
    const resourceItem = fixture.debugElement.query(By.css('.resource-item'));
    resourceItem.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Set up spy for output event
    const outputSpy = jasmine.createSpy('resourceSelectedSpy');
    component.resourceSelected.subscribe(outputSpy);

    // Programmatically clear selection
    component.clearSelection();
    fixture.detectChanges();

    // Verify input field is cleared
    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.value).toBe('');

    // Verify output was emitted
    expect(outputSpy).toHaveBeenCalled();

    // Verify image is no longer displayed
    const img = fixture.debugElement.query(By.css('.input-group-prepend img'));
    expect(img).toBeFalsy();
  });

  it('should open dropdown when open dropdown button is clicked and close when close button is clicked', () => {
    // Initially dropdown should not be visible
    let dropdown = fixture.debugElement.query(By.css('.dropdown-menu.show'));
    expect(dropdown).toBeFalsy();

    // Find and click the open dropdown button
    const searchBtnIcon = fixture.debugElement.query(
      By.css('.bi-chevron-down')
    );
    expect(searchBtnIcon)
      .withContext('Open dropdown button icon should exist')
      .toBeTruthy();
    const searchBtn = searchBtnIcon.parent;
    expect(searchBtn)
      .withContext('Open dropdown button should exist')
      .toBeTruthy();
    searchBtn!.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Dropdown should be visible
    dropdown = fixture.debugElement.query(By.css('.dropdown-menu.show'));
    expect(dropdown).toBeTruthy();

    // Find and click the close button that appears when dropdown is open
    const closeBtnIcon = fixture.debugElement.query(By.css('.bi-chevron-up'));
    expect(closeBtnIcon)
      .withContext('Close button icon should exist')
      .toBeTruthy();
    const closeBtn = closeBtnIcon.parent;
    expect(closeBtn).withContext('Close button should exist').toBeTruthy();
    closeBtn!.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Dropdown should be hidden
    dropdown = fixture.debugElement.query(By.css('.dropdown-menu.show'));
    expect(dropdown).toBeFalsy();
  });

  it('should hide dropdown after blur', (done) => {
    // First show the dropdown
    component.toggleDropdown();
    fixture.detectChanges();

    // Verify dropdown is visible
    let dropdown = fixture.debugElement.query(By.css('.dropdown-menu.show'));
    expect(dropdown).toBeTruthy();

    // Trigger blur event on input
    const inputEl = fixture.debugElement.query(By.css('input'));
    inputEl.triggerEventHandler('blur', null);

    // Wait for the setTimeout to complete (slightly longer than the 200ms in the component)
    setTimeout(() => {
      // Need to detect changes again after the timeout
      fixture.detectChanges();

      // Dropdown should now be hidden
      dropdown = fixture.debugElement.query(By.css('.dropdown-menu.show'));
      expect(dropdown).toBeFalsy();
      done(); // Tell Jasmine we're done with the async test
    }, 250);
  });

  it('should clear search term on blur when no resource is selected', (done) => {
    // Simulate typing in the search box
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    input.value = 'test search';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Verify search term is set
    expect(input.value).toBe('test search');

    // Simulate blur event
    const inputEl = fixture.debugElement.query(By.css('input'));
    inputEl.triggerEventHandler('blur', null);

    // Use setTimeout to handle the async nature of hideDropdown
    setTimeout(() => {
      fixture.detectChanges();
      // Search term should be cleared
      expect(input.value).toBe('');
      done();
    }, 250);
  });

  it('should show "No resources found" when search has no results', (done) => {
    // Mock empty search results
    mockResourcesService.findResourcesByName.and.returnValue([]);

    // Show dropdown
    component.toggleDropdown();
    fixture.detectChanges();

    // Set non-matching search term
    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    inputEl.value = 'nonexistent';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Wait for debounce to complete
    setTimeout(() => {
      fixture.detectChanges();

      // Verify "No resources found" message is shown
      const noResults = fixture.debugElement.query(
        By.css('.dropdown-menu.show .dropdown-item')
      );
      expect(noResults.nativeElement.textContent.trim()).toBe(
        'No resources found'
      );
      done();
    }, 350); // Wait slightly longer than the debounce delay
  });

  it('should restore selected resource name on blur after typing', (done) => {
    // First select a resource via the UI
    component.toggleDropdown();
    fixture.detectChanges();

    // Find and click the first resource item
    const resourceItem = fixture.debugElement.query(By.css('.resource-item'));
    resourceItem.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Verify the resource name is in the input
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.value)
      .withContext('Input should display selected resource name')
      .toBe(mockResources[0].displayName);

    // Now type something else in the search box
    input.value = 'qwe';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Verify the search term has changed
    expect(input.value)
      .withContext('Input should display the typed search term')
      .toBe('qwe');

    // Simulate blur event
    const inputEl = fixture.debugElement.query(By.css('input'));
    inputEl.triggerEventHandler('blur', null);

    // Wait for the setTimeout to complete
    setTimeout(() => {
      fixture.detectChanges();

      // Search term should be restored to the resource name
      expect(input.value).toBe(mockResources[0].displayName);
      done();
    }, 250);
  });

  it('should show open dropdown button instead of clear button when not searching', () => {
    // Initially should show open dropdown button
    const searchButton = fixture.debugElement.query(By.css('.bi-chevron-down'));
    const clearButton = fixture.debugElement.query(By.css('.bi-x'));

    expect(searchButton)
      .withContext('Open dropdown button should be visible')
      .toBeTruthy();
    expect(clearButton)
      .withContext('Clear button should not be visible')
      .toBeFalsy();
  });

  it('should show clear search button when typing something different', () => {
    // First select a resource via the UI
    component.toggleDropdown();
    fixture.detectChanges();

    // Find and click the first resource item
    const resourceItem = fixture.debugElement.query(By.css('.resource-item'));
    resourceItem.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Initially should show open dropdown button, not clear button
    let searchButton = fixture.debugElement.query(By.css('.bi-chevron-down'));
    let clearButton = fixture.debugElement.query(By.css('.bi-x'));

    expect(searchButton)
      .withContext('Open dropdown button should be visible initially')
      .toBeTruthy();
    expect(clearButton)
      .withContext('Clear button should not be visible initially')
      .toBeFalsy();

    // Now type something different in the search box
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    input.value = 'something different';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Now should show clear button instead of search button
    searchButton = fixture.debugElement.query(By.css('.bi-search'));
    clearButton = fixture.debugElement.query(By.css('.bi-x'));

    expect(searchButton)
      .withContext('Search button should not be visible when searching')
      .toBeFalsy();
    expect(clearButton)
      .withContext('Clear search button should be visible when searching')
      .toBeTruthy();
  });

  it('should clear only search text when clear button is clicked', () => {
    // First select a resource via the UI
    component.toggleDropdown();
    fixture.detectChanges();

    // Find and click the first resource item
    const resourceItem = fixture.debugElement.query(By.css('.resource-item'));
    resourceItem.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Type something different
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    input.value = 'test query';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Click the clear search button
    const clearButton = fixture.debugElement.query(By.css('.bi-x'));
    expect(clearButton)
      .withContext('Clear button should be visible')
      .toBeTruthy();

    // Find the button that contains the clear icon
    const clearButtonParent = fixture.debugElement.query(
      By.css('button.btn-outline-secondary')
    );
    clearButtonParent.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Search text should be cleared but resource selection should remain
    expect(input.value)
      .withContext('Input should show selected resource name')
      .toBe(mockResources[0].displayName);

    // Image should still be visible (selection wasn't cleared)
    const imgContainer = fixture.debugElement.query(
      By.css('.input-group-prepend')
    );
    expect(imgContainer)
      .withContext('Resource image should still be visible')
      .toBeTruthy();
  });

  it('should keep dropdown open with all resources when clear search button is clicked without selection', () => {
    // First set search text to trigger the clear button to appear
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    input.value = 'qwe';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Verify clear search button is visible
    const clearButton = fixture.debugElement.query(By.css('.bi-x'));
    expect(clearButton)
      .withContext('Clear search button should be visible')
      .toBeTruthy();

    // Click clear search button
    const clearButtonParent = fixture.debugElement.query(
      By.css('button.btn-outline-secondary')
    );
    clearButtonParent.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Verify dropdown is still open
    const dropdownMenu = fixture.debugElement.query(
      By.css('.dropdown-menu.show')
    );
    expect(dropdownMenu)
      .withContext('Dropdown should remain open after clearing search')
      .toBeTruthy();

    // Verify all resources are displayed
    const resourceItems = fixture.debugElement.queryAll(
      By.css('.resource-item')
    );
    expect(resourceItems.length)
      .withContext('All resources should be displayed')
      .toBe(mockResources.length);
  });

  it('should replace open dropdown button with close button when dropdown is open', () => {
    // Initially should show open dropdown button and no close button
    const initialSearchButton = fixture.debugElement.query(
      By.css('.bi-chevron-down')
    );
    const initialCloseButton = fixture.debugElement.query(
      By.css('.bi-chevron-up')
    );

    expect(initialSearchButton)
      .withContext('Open dropdown button should be visible initially')
      .toBeTruthy();
    expect(initialCloseButton)
      .withContext('Close button should not be visible initially')
      .toBeFalsy();

    // Open the dropdown
    component.toggleDropdown();
    fixture.detectChanges();

    // Open dropdown button should be hidden and close button should be visible when dropdown is open
    const searchButton = fixture.debugElement.query(By.css('.bi-chevron-down'));
    const closeButton = fixture.debugElement.query(By.css('.bi-chevron-up'));

    expect(searchButton)
      .withContext(
        'Open dropdown button should be hidden when dropdown is open'
      )
      .toBeFalsy();
    expect(closeButton)
      .withContext('Close button should be visible when dropdown is open')
      .toBeTruthy();
  });

  it('should navigate down through resources with arrow keys', () => {
    // Set up resources and show dropdown
    component.toggleDropdown();
    fixture.detectChanges();

    // Initial state: no active item
    expect(component['activeIndex']())
      .withContext('Initial activeIndex should be -1')
      .toBe(-1);

    // Simulate arrow down key press
    const input = fixture.debugElement.query(By.css('input'));
    input.triggerEventHandler('keydown', {
      key: 'ArrowDown',
      preventDefault: jasmine.createSpy(),
    });
    fixture.detectChanges();

    // First item should now be active
    expect(component['activeIndex']())
      .withContext('activeIndex should be 0 after ArrowDown')
      .toBe(0);

    // Check that the active class is applied in the DOM
    const firstItem = fixture.debugElement.query(
      By.css('.dropdown-item.active')
    );
    expect(firstItem)
      .withContext('First dropdown item should have active class')
      .toBeTruthy();
  });

  it('should navigate up through resources with arrow keys', () => {
    // Set up resources and show dropdown
    component.toggleDropdown();
    fixture.detectChanges();

    // Set initial active index to last item
    component['activeIndex'].set(mockResources.length - 1);
    fixture.detectChanges();

    // Simulate arrow up key press
    const input = fixture.debugElement.query(By.css('input'));
    input.triggerEventHandler('keydown', {
      key: 'ArrowUp',
      preventDefault: jasmine.createSpy(),
    });
    fixture.detectChanges();

    // Previous item should now be active
    expect(component['activeIndex']())
      .withContext('activeIndex should decrease after ArrowUp')
      .toBe(mockResources.length - 2);
  });

  it('should select resource with Enter key', () => {
    // Set up resources and show dropdown
    component.toggleDropdown();
    fixture.detectChanges();

    // Set active index to first item
    component['activeIndex'].set(0);
    fixture.detectChanges();

    // Create spy for the output
    const resourceSelectedSpy = spyOn(component.resourceSelected, 'emit');

    // Simulate Enter key press
    const input = fixture.debugElement.query(By.css('input'));
    input.triggerEventHandler('keydown', {
      key: 'Enter',
      preventDefault: jasmine.createSpy(),
    });
    fixture.detectChanges();

    // Should have selected the first resource
    expect(resourceSelectedSpy)
      .withContext('resourceSelected should emit the first resource')
      .toHaveBeenCalledWith(mockResources[0]);

    // The input field should display the selected resource name
    expect(component['searchTerm']())
      .withContext('searchTerm should be updated to resource name')
      .toBe(mockResources[0].displayName);
  });

  it('should close dropdown when Escape key is pressed', () => {
    // Set up resources and show dropdown
    component.toggleDropdown();
    fixture.detectChanges();

    // Verify dropdown is shown
    expect(component['showDropdown']())
      .withContext('Dropdown should be visible initially')
      .toBeTrue();

    // Simulate Escape key press
    const input = fixture.debugElement.query(By.css('input'));
    input.triggerEventHandler('keydown', {
      key: 'Escape',
      preventDefault: jasmine.createSpy(),
    });
    fixture.detectChanges();

    // Dropdown should be closed
    expect(component['showDropdown']())
      .withContext('Dropdown should be hidden after Escape key')
      .toBeFalse();
  });

  it('should not exceed bounds when navigating with arrow keys', () => {
    // Set up resources and show dropdown
    component.toggleDropdown();
    fixture.detectChanges();

    // Navigate to first item
    component['activeIndex'].set(0);
    fixture.detectChanges();

    // Try to navigate up (beyond first item)
    const input = fixture.debugElement.query(By.css('input'));
    input.triggerEventHandler('keydown', {
      key: 'ArrowUp',
      preventDefault: jasmine.createSpy(),
    });
    fixture.detectChanges();

    // Should not go below 0
    expect(component['activeIndex']())
      .withContext('activeIndex should not go below 0')
      .toBe(0);

    // Set to last item
    component['activeIndex'].set(mockResources.length - 1);
    fixture.detectChanges();

    // Try to navigate down (beyond last item)
    input.triggerEventHandler('keydown', {
      key: 'ArrowDown',
      preventDefault: jasmine.createSpy(),
    });
    fixture.detectChanges();

    // Should not exceed array length
    expect(component['activeIndex']())
      .withContext('activeIndex should not exceed array length - 1')
      .toBe(mockResources.length - 1);
  });

  it('should ignore keyboard navigation when dropdown is closed', () => {
    // Ensure dropdown is closed
    component['showDropdown'].set(false);
    fixture.detectChanges();

    // Set a spy on activeIndex
    const activeIndexSpy = spyOn(
      component['activeIndex'],
      'update'
    ).and.callThrough();

    // Simulate arrow key press
    const input = fixture.debugElement.query(By.css('input'));
    input.triggerEventHandler('keydown', {
      key: 'ArrowDown',
      preventDefault: jasmine.createSpy(),
    });
    fixture.detectChanges();

    // activeIndex should not be updated
    expect(activeIndexSpy)
      .withContext('activeIndex should not be updated when dropdown is closed')
      .not.toHaveBeenCalled();
  });
  it('should handle Enter key press to select item', () => {
    // Set up resources and show dropdown
    component.toggleDropdown();
    fixture.detectChanges();

    // Set active index to first item
    component['activeIndex'].set(0);
    fixture.detectChanges();

    // Spy on the output event instead of the internal method
    const resourceSelectedSpy = spyOn(component.resourceSelected, 'emit');

    // Simulate Enter key press via DOM
    const input = fixture.debugElement.query(By.css('input'));

    // Create a spy for the native element's blur method
    const blurSpy = spyOn(input.nativeElement, 'blur');

    // Simulate keydown event via the DOM
    const keydownEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
    });

    // Add a spy on preventDefault to verify it was called
    spyOn(keydownEvent, 'preventDefault');

    // Dispatch the event on the input element
    input.nativeElement.dispatchEvent(keydownEvent);
    fixture.detectChanges();

    // Verify the resource was selected by checking the output event
    expect(resourceSelectedSpy)
      .withContext(
        'resourceSelected output should emit with the active resource'
      )
      .toHaveBeenCalledWith(mockResources[0]);

    // Check if input displays the selected resource name
    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.value)
      .withContext('Input should display the selected resource name')
      .toBe(mockResources[0].displayName);

    // Check if blur was called
    expect(blurSpy)
      .withContext('blur() should be called on input after Enter key selection')
      .toHaveBeenCalled();
  });
});
