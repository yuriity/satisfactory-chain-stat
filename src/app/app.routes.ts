import { Routes } from '@angular/router';
import { BoardComponent } from './components/board/board.component';
import { RecipesComponent } from './components/recipes/recipes.component';

export const routes: Routes = [
  { path: '', component: BoardComponent },
  { path: 'recipes', component: RecipesComponent },
  { path: '**', redirectTo: '' },
];
