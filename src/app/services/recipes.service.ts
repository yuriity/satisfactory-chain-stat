import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resource } from '../models/resource';
import { Recipe, RecipeGroup } from '../models/recipe';
import { RecipeGroupScaffold } from './recipe-group-scaffold';
import { ResourcesService } from './resources.service';

const ProducedInPriority: { [key: string]: number } = {
  'desc-smeltermk1-c': 1,
  'desc-foundrymk1-c': 2,
  'desc-constructormk1-c': 3,
  'desc-assemblermk1-c': 4,
  'desc-manufacturermk1-c': 5,
  'desc-packager-c': 6,
  'desc-oilrefinery-c': 7,
  'desc-blender-c': 8,
  'desc-hadroncollider-c': 9,
  'desc-quantumencoder-c': 10,
  'desc-converter-c': 11,
};

interface dataRecipe {
  shortName: string;
  displayName: string;
  alternate: boolean;
  ingredients: {
    resourceClassName: string;
    amount: number;
  }[];
  products: {
    resourceClassName: string;
    amount: number;
  }[];
  manufactoringDuration: number;
  producedIn: string;
  techTier: number;
}

interface GroupedRecipes {
  [productClassName: string]: dataRecipe[];
}

@Injectable({
  providedIn: 'root',
})
export class RecipesService {
  private resourcesService = inject(ResourcesService);
  private resourcesDataSource = '/data/en-US_recipes.json';
  private recipeGroupsSignal = signal<RecipeGroup[]>([]);
  private isLoading = signal(false);
  private error = signal<Error | null>(null);

  public readonly recipeGroups = this.recipeGroupsSignal.asReadonly();
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

  private loadResources(): void {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<GroupedRecipes>(this.resourcesDataSource).subscribe({
      next: (groupedRecipes) => this.processGroupedRecipes(groupedRecipes),
      error: (err) => {
        console.error('Failed to load resources:', err);
        this.error.set(err);
        this.isLoading.set(false);
      },
    });
  }

  private processGroupedRecipes(groupedRecipes: GroupedRecipes): void {
    const recipeGroups: RecipeGroup[] = [];

    // console.log(
    //   `groupedRecipes.length BEFORE: ${Object.keys(groupedRecipes).length}`
    // );
    for (const groupScaffold of RecipeGroupScaffold) {
      const recipeGroup = {
        name: groupScaffold.name,
        bgHexColor: groupScaffold.bgHexColor,
        recipes: [] as Recipe[],
      };

      for (const productClassName of groupScaffold.products) {
        if (productClassName in groupedRecipes) {
          const recipes = this.processRecipes(groupedRecipes[productClassName]);
          recipeGroup.recipes.push(...recipes);
          delete groupedRecipes[productClassName];
        } else {
          console.warn(
            `No recipes found for product class name: ${productClassName}`
          );
        }
      }

      recipeGroups.push(recipeGroup);
    }
    // console.log(
    //   `groupedRecipes.length AFTER: ${Object.keys(groupedRecipes).length}`
    // );

    // for (const element of Object.keys(groupedRecipes)) {
    //   console.log(element);
    // }

    this.recipeGroupsSignal.set(recipeGroups);
    this.isLoading.set(false);
  }

  private processRecipes(recipes: dataRecipe[]): Recipe[] {
    const processedRecipes = recipes.map((recipe) => {
      const ingredients = recipe.ingredients.map((ing) => ({
        resource: this.resourcesService.getResourceByClassName(
          ing.resourceClassName
        ),
        amount: ing.amount,
      }));

      const products = recipe.products.map((prod) => ({
        resource: this.resourcesService.getResourceByClassName(
          prod.resourceClassName
        ),
        amount: prod.amount,
      }));

      return {
        shortName: recipe.shortName,
        displayName: recipe.displayName,
        alternate: recipe.alternate,
        ingredients,
        products,
        manufactoringDuration: recipe.manufactoringDuration,
        producedIn: recipe.producedIn,
        techTier: recipe.techTier,
      } as Recipe;
    });

    return processedRecipes.sort((a, b) => {
      // 1. Alternate recipes come first
      if (a.alternate !== b.alternate) {
        return a.alternate ? 1 : -1;
      }

      const producedInPriorityA = ProducedInPriority[a.producedIn];
      const producedInPriorityB = ProducedInPriority[b.producedIn];
      if (producedInPriorityA !== producedInPriorityB) {
        return producedInPriorityA - producedInPriorityB;
      }

      // 3. Sort by ingredientsSinkPoint ascending
      const aSink = a.ingredients.reduce(
        (acc, curr) => acc + (curr.resource?.sinkPoints ?? 0),
        0
      );
      const bSink = b.ingredients.reduce(
        (acc, curr) => acc + (curr.resource?.sinkPoints ?? 0),
        0
      );
      return aSink - bSink;
    });
  }
}
