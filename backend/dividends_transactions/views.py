import logging
from datetime import datetime

from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg import openapi
from rest_framework import viewsets
from rest_framework.pagination import LimitOffsetPagination

from companies.models import Company
from dividends_transactions.models import DividendsTransaction
from dividends_transactions.serializers import DividendsTransactionSerializer
from log_messages.models import LogMessage
from stats.tasks import update_portfolio_stats

logger = logging.getLogger("buho_backend")
update_portfolio_desc = (
    "Whether or not to update the portfolio stats after adding the dividend"
)
update_portfolio_param = openapi.Parameter(
    "updatePortfolio",
    openapi.IN_FORM,
    description=update_portfolio_desc,
    type=openapi.TYPE_BOOLEAN,
)


class DividendsViewSet(viewsets.ModelViewSet):
    """CRUD operations for dividends transactions"""

    serializer_class = DividendsTransactionSerializer
    pagination_class = LimitOffsetPagination
    queryset = DividendsTransaction.objects.all()
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ["company"]

    def perform_create(self, serializer):
        super().perform_create(serializer)
        # Log the operation
        company = Company.objects.get(id=serializer.data["company"])
        self.create_add_dividends_log_message(serializer, company)
        self.add_dividends_update_company_stats(serializer, company)

    def perform_update(self, serializer):
        super().perform_update(serializer)
        # Log the operation
        company = Company.objects.get(id=serializer.data["company"])
        self.create_update_dividends_log_message(serializer, company)
        self.add_dividends_update_company_stats(serializer, company)

    def add_dividends_update_company_stats(self, serializer, company):
        logger.debug(f"Updating company stats for {company.name} after adding dividend")
        transaction_date = datetime.strptime(
            serializer.data.get("transaction_date"), "%Y-%m-%d"
        )

        update_portfolio = self.request.data.get("updatePortfolio", False)

        if update_portfolio:
            update_portfolio_stats.delay(
                company.portfolio_id, [company.id], transaction_date.year
            )

    def create_add_dividends_log_message(self, serializer, company):
        LogMessage.objects.create(
            message_type=LogMessage.MESSAGE_TYPE_ADD_DIVIDEND,
            message_text=(
                f"Dividend added: {company.name} ({company.ticker}). Amount: "
                f"{serializer.data.get('total_amount')}. {serializer.data.get('notes')}"
            ),
            portfolio=company.portfolio,
        )

    def create_update_dividends_log_message(self, serializer, company):
        LogMessage.objects.create(
            message_type=LogMessage.MESSAGE_TYPE_UPDATE_DIVIDEND,
            message_text=(
                f"Dividend updated: {company.name} ({company.ticker}). Amount: "
                f"{serializer.data.get('total_amount')}. {serializer.data.get('notes')}"
            ),
            portfolio=company.portfolio,
        )
