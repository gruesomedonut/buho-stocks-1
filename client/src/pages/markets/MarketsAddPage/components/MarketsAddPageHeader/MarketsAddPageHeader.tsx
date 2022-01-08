import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "antd";
import breadCrumbRender from "breadcrumbs";

interface Props {
  children: ReactNode;
}
function MarketsAddPageHeader({ children }: Props) {
  const { t } = useTranslation();
  const routes = [
    {
      path: `/app/markets`,
      breadcrumbName: t("Markets"),
    },
    {
      path: `/app/markets/add`,
      breadcrumbName: "Add market",
    },
  ];
  return (
    <PageHeader
      className="site-page-header"
      title={t("Add market")}
      breadcrumb={{ routes }}
      breadcrumbRender={breadCrumbRender}
    >
      {children}
    </PageHeader>
  );
}

export default MarketsAddPageHeader;
