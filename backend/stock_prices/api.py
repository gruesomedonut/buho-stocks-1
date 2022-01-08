import datetime
import logging
from stock_prices.models import StockPrice
from stock_prices.serializers import StockPriceSerializer
from stock_prices.services.service_base import StockPriceServiceBase

logger = logging.getLogger("buho_backend")

class StockPricesApi:
    def __init__(
        self,
        stock_prices_service: StockPriceServiceBase,
    ):
        self.stock_prices_service = stock_prices_service

    # def get_current_price(self, stock_symbol):
    #     return self.stock_prices_service.get_stock_prices(stock_symbol)

    def get_current_data(self, ticker):

        try:
            data = StockPrice.objects.get(
                ticker=ticker, transaction_date=datetime.date.today()
            )
        except StockPrice.DoesNotExist:
            data = self.stock_prices_service.get_current_data(ticker)

            data = {
                "company_name": data["company_name"],
                "price": data["price"],
                "price_currency": data["price_currency"],
                "ticker": ticker,
                "transaction_date": data["transaction_date"],
            }

        serializer = StockPriceSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return serializer.data

    def get_historical_data(
        self, ticker: str, from_date: str, to_date: str, minimum_values: int = None
    ) -> dict:
        """Get the historical prices for a given ticker and range of dates.

        Args:
            ticker (str): Ticker of the company
            from_date (str): Start date of the range
            to_date (str): End date of the range
            minimum_values (int, optional): Minimum values to retrieve. Defaults to None.

        Returns:
            dict: [description]
        """
        prices = StockPrice.objects.filter(
            ticker=ticker, transaction_date__range=[from_date, to_date]
        )

        from_datetime = datetime.date.fromisoformat(from_date)
        to_datetime = datetime.date.fromisoformat(to_date)

        delta = to_datetime - from_datetime
        prices_length = len(prices)

        if minimum_values is None:
            minimum_values = delta.days / 2 - 1

        if prices_length < minimum_values:
            logger.debug("No historical data found locally. Searching remote.")
            prices = self.stock_prices_service.get_historical_data(
                ticker, from_date, to_date
            )

            for price in prices:
                serializer = StockPriceSerializer(data=price)
                if serializer.is_valid():
                    serialized_date = price.get("transaction_date", "unknown")
                    print(f"{ticker}-{serialized_date}. Saving element.")
                    serializer.save()
                else:
                    serialized_date = serializer.data.get("transaction_date", "unknown")
                    print(
                        f"{ticker} - {serialized_date}. Error on price :{serializer.errors}"
                    )
            serializer = StockPriceSerializer(instance=prices, many=True)
            return serializer.data
        else:
            serializer = StockPriceSerializer(instance=prices, many=True)
            return serializer.data

    def get_monthly_data(self, ticker: str, year: int, month: int) -> dict:
        from_date = f"{year}-{month}-01"

        end_day = 31
        if month in [4, 6, 9, 11]:
            end_day = 30
        elif month == 2:
            end_day = 28

        to_date = f"{year}-{month}-{end_day}"
        return self.get_historical_data(ticker, from_date, to_date)

    def get_last_data_from_year(self, ticker: str, year: int) -> dict:
        from_date = f"{year}-12-01"
        to_date = f"{year}-12-31"
        results = self.get_historical_data(ticker, from_date, to_date, minimum_values=1)
        if len(results) > 0:
            return results[-1]

    def get_last_data_from_last_month(self, ticker: str) -> dict:
        from_date = (datetime.date.today() - datetime.timedelta(days=31)).strftime(
            "%Y-%m-%d"
        )
        to_date = datetime.date.today().strftime("%Y-%m-%d")
        results = self.get_historical_data(ticker, from_date, to_date, minimum_values=1)
        if len(results) > 0:
            return results[-1]
