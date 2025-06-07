import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';
import { Resource } from '../models/resource';

@Injectable({
  providedIn: 'root',
})
export class ResourcesService {
  private resources$: Observable<Resource[]> | undefined;

  constructor(private http: HttpClient) {}

  getResources(): Observable<Resource[]> {
    if (!this.resources$) {
      this.resources$ = this.http.get<any[]>('/en-US_extracted.json').pipe(
        shareReplay(1) // Cache the result and replay for subsequent subscribers
      );
    }
    return this.resources$;
  }
}
