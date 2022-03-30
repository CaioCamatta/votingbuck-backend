import { Router } from 'express';
import SearchController from '@controllers/search.controller';
import { Routes } from '@interfaces/routes.interface';

class SearchRoute implements Routes {
  public path = '/search';
  public router = Router();
  public searchController = new SearchController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET results for a search query.
    this.router.get(`${this.path}/:query(*)`, this.searchController.getSearchData);
  }
}

export default SearchRoute;
