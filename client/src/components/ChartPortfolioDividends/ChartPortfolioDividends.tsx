import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BarChart } from "@mantine/charts";
import { Center, Loader, Stack, Title } from "@mantine/core";
import i18next from "i18next";
import { IPortfolioYearStats } from "types/portfolio-year-stats";

interface Props {
  data: IPortfolioYearStats[];
  baseCurrencyCode: string;
}

export default function ChartPortfolioDividends({
  data,
  baseCurrencyCode,
}: Props) {
  const { t } = useTranslation();

  const { resolvedLanguage } = i18next;

  const numberFormatter = new Intl.NumberFormat(resolvedLanguage, {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const chartData = useMemo(() => {
    if (data && data.length > 0) {
      const newYears: any = [];
      const dividends: any = [];
      const dividendsPerYear: {
        year: number;
        value: number;
      }[] = [];

      data.sort((a: any, b: any) => {
        if (a.year > b.year) {
          return 1;
        }
        if (a.year < b.year) {
          return -1;
        }
        return 0;
      });
      data.forEach((year: any) => {
        if (
          !newYears.includes(year.year) &&
          year.year !== "all" &&
          year.year !== 9999
        ) {
          newYears.push(year.year);
          dividends.push(Number(year.dividends));
          dividendsPerYear.push({
            year: year.year,
            value: Number(year.dividends),
          });
        }
      });

      // Sort the sectors by value
      dividendsPerYear.sort((a, b) => a.year - b.year);

      return dividendsPerYear;
    }
  }, [data]);

  if (chartData && baseCurrencyCode) {
    return (
      <Stack>
        <Center>
          <Title order={5}>{t("Portfolio Dividends")}</Title>
        </Center>
        <Center>
          <BarChart
            h={400}
            data={chartData}
            dataKey="year"
            series={[{ name: "value", color: "red" }]}
            valueFormatter={(value: number) =>
              `${numberFormatter.format(value)} ${baseCurrencyCode}`
            }
            xAxisProps={{
              interval: 0,
              textAnchor: "end",
              height: 50, // Increase height to avoid clipping the labels
              tick: {
                style: { fontSize: 10 },
                transform: "translate(-10, 0)", // Adjust label position
              },
            }}
          />
        </Center>
      </Stack>
    );
  }
  return <Loader data-testid="loader" />;
}
