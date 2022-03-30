import { SearchResult } from '@/interfaces/search.interface';
import SearchService from '@/services/search.service';
import { NextFunction, Request, Response } from 'express';

class SearchController {
  public searchService = new SearchService();

  constructor() {
    this._populateRedisSearch();
  }

  /** Populate RedisSearch if necessary */
  private _populateRedisSearch = async (): Promise<void> => {
    await this.searchService.populateRedisSearch();
  };

  public getSearchData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const searchQuery = req.params.query;

      // Get top results across all three categories
      const searchDataPolitician: SearchResult = await this.searchService.search(searchQuery, 'politician');
      const searchDataCorporate: SearchResult = await this.searchService.search(searchQuery, 'corporate');
      const searchDataUniveristy: SearchResult = await this.searchService.search(searchQuery, 'university');

      res.status(200).json({
        politicians: searchDataPolitician.documents,
        corporates: searchDataCorporate.documents,
        universities: searchDataUniveristy.documents,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default SearchController;
