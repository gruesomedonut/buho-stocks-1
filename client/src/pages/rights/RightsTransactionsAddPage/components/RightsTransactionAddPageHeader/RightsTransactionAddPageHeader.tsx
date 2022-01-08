import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { PageHeader } from "antd";
import breadCrumbRender from "breadcrumbs";
import CountryFlag from "components/CountryFlag/CountryFlag";

interface Props {
  companyName: string;
  companyTicker: string;
  companyCountryCode: string;
  portfolioName: string;
  children: ReactNode;
}

function RightsTransactionAddPageHeader({
  companyName,
  companyTicker,
  companyCountryCode,
  portfolioName,
  children,
}: Props) {
  const { t } = useTranslation();
  const { id, companyId } = useParams();
  const routes = [
    {
      path: `/app/portfolios/${id}`,
      breadcrumbName: portfolioName,
    },
    {
      path: `/app/portfolios/${id}/companies/${companyId}`,
      breadcrumbName: companyName,
    },
    {
      path: `/app/portfolios/${id}/companies/${companyId}/rights/add`,
      breadcrumbName: t("Add a new rights"),
    },
  ];
  return (
    <PageHeader
      className="site-page-header"
      title={`${t("Add a new rights")}`}
      subTitle={`${companyName} (${companyTicker})`}
      breadcrumb={{ routes }}
      breadcrumbRender={breadCrumbRender}
      tags={[
        <CountryFlag code={companyCountryCode} key={companyCountryCode} />,
      ]}
    >
      {children}
    </PageHeader>
  );
}

export default RightsTransactionAddPageHeader;
