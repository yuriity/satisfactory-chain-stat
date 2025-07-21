import { Routes } from '@angular/router';
import { RecipesComponent } from './recipes/recipes.component';
import { BoardComponent } from './home/board/board.component';

export const routes: Routes = [
  { path: '', component: BoardComponent },
  { path: 'recipes', component: RecipesComponent },
  { path: '**', redirectTo: '' },
];
