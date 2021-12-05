import React, { ReactElement } from "react";
import { Col, Row } from "antd";
import CurrenciesAddPageHeader from "./components/CurrenciesAddPageHeader/CurrenciesAddPageHeader";
import CurrencyAddEditForm from "components/CurrencyAddEditForm/CurrencyAddEditForm";
import { CurrenciesContext } from "contexts/currencies";
import { useCurrenciesContext } from "hooks/use-currencies/use-currencies-context";
import WrapperPage from "pages/WrapperPage/WrapperPage";

export default function CurrenciesPage(): ReactElement {
  const currenciesContext = useCurrenciesContext();

  return (
    <CurrenciesContext.Provider value={currenciesContext}>
      <WrapperPage>
        <CurrenciesAddPageHeader>
          <Row>
            <Col>
              <CurrencyAddEditForm />
            </Col>
            <Col />
          </Row>
        </CurrenciesAddPageHeader>
      </WrapperPage>
    </CurrenciesContext.Provider>
  );
}
