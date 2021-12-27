/* eslint-disable react/prop-types */
/* eslint-disable import/no-extraneous-dependencies */
import React from "react";
import { Router } from "react-router-dom";
import { render } from "@testing-library/react";
import { createMemoryHistory } from "history";

/**
 * Render a component with React Router support
 * @param {*} ui
 * @param {*} param1
 */
function renderWithRouter(
  ui,
  {
    route = "/",
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) {
  function Wrapper({ children }) {
    return <Router history={history}>{children}</Router>;
  }
  return {
    ...render(ui, { wrapper: Wrapper }),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history
  };
}

// re-export everything
export * from "@testing-library/react";

// override render method
export { renderWithRouter };
