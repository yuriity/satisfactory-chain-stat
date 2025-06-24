import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { LocationsService } from './services/locations.service';
import { Resource } from './models/resource';
import { ResourcesService } from './services/resources.service';
import { BoardComponent } from './components/board/board.component';

@Component({
  selector: 'scs-root',
  standalone: true,
  imports: [BoardComponent, CommonModule, NgbDropdownModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Satisfactory Chain Stat';
  protected locationsService = inject(LocationsService);
  protected resourcesService = inject(ResourcesService);
  protected selectedResource = signal<Resource | null>(null);

  protected createNewLocation(): void {
    this.locationsService.newLocation();
  }

  protected exportData(): void {
    try {
      this.locationsService.exportLocations();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  }

  protected importData(): void {
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';

    fileInput.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) {
        return;
      }

      try {
        // Confirm before replacing existing data
        const currentLocations = this.locationsService.locations();
        const confirmMessage = `This will replace all current locations (${currentLocations.length}). Are you sure?`;

        if (confirm(confirmMessage)) {
          await this.locationsService.importLocations(file);
          const newLocations = this.locationsService.locations();
          alert(`Successfully imported ${newLocations.length} location(s).`);
        }
      } catch (error) {
        console.error('Import failed:', error);
        alert(
          'Failed to import data. Please check the file format and try again.'
        );
      } finally {
        // Clean up
        document.body.removeChild(fileInput);
      }
    };

    // Trigger file selection
    document.body.appendChild(fileInput);
    fileInput.click();
  }
}
