import { ICompany } from "./company";
import { ICurrency } from "./currency";

interface IPortfolioBase {
  name: string;
  description: string;
  color: string;
  hideClosedCompanies: boolean;
}

export interface IPortfolioFormFields extends IPortfolioBase {
  baseCurrency: number;
}

export interface IPortfolio extends IPortfolioBase {
  id: number;
  baseCurrency: ICurrency;
  companies: ICompany[];
  dateCreated: string;
  lastUpdated: string;
}

export interface IPortfolioRouteParams {
  computedMatch: {
    params: {
      id: string;
    };
  };
}
