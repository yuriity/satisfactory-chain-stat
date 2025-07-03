import { Resource } from './resource';

export interface Recipe {
  readonly shortName: string;
  readonly displayName: string;
  readonly alternate: boolean;
  readonly ingredients: Array<{
    resource: Resource;
    amount: number;
  }>;
  readonly products: Array<{
    resource: Resource;
    amount: number;
  }>;
  readonly manufactoringDuration: number;
  readonly producedIn: string;
  readonly techTier: number;
}

export interface RecipeGroup {
  readonly name: string;
  readonly bgHexColor: string;
  readonly recipes: Array<Recipe>;
}
