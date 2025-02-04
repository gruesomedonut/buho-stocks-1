import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "api/api-client";
import queryClient from "api/query-client";
import { IPortfolioYearStats } from "types/portfolio-year-stats";

export const fetchYearStats = async (
  portfolioId: number | undefined,
  year: string | undefined,
) => {
  const { data } = await apiClient.get<IPortfolioYearStats>(
    `/stats/portfolio/${portfolioId}/year/${year}/`,
  );
  return data;
};

export const fetchYearStatsByMonth = async (
  portfolioId: number | undefined,
  year: string | undefined,
) => {
  const { data } = await apiClient.get<IPortfolioYearStats[]>(
    `/stats/portfolio/${portfolioId}/year/${year}/grouped-by-month/`,
  );
  return data;
};

export const fetchYearStatsByCompany = async (
  portfolioId: number | undefined,
  year: string | undefined,
) => {
  const { data } = await apiClient.get<IPortfolioYearStats[]>(
    `/stats/portfolio/${portfolioId}/year/${year}/grouped-by-company/`,
  );
  return data;
};

export const fetchAllYearsStats = async (portfolioId: number | undefined) => {
  const { data } = await apiClient.get<IPortfolioYearStats[]>(
    `/stats/portfolio/${portfolioId}/`,
  );
  return data;
};

/**
 * Get the portfolio stats for a given year
 * @param portfolioId Portfolio ID
 * @param year Year of the stats: 2020, 2021, etc. or 'all'
 * @param otherOptions
 * @returns A IPortfolioYearStats object
 */
export function usePortfolioYearStats(
  portfolioId: number | undefined,
  year: string | undefined,
  otherOptions?: any,
) {
  return useQuery<IPortfolioYearStats, Error>({
    queryKey: ["portfolioYearStats", portfolioId, year],
    queryFn: () => fetchYearStats(portfolioId, year),
    enabled: !!portfolioId && !!year,
    ...otherOptions,
  });
}

/**
 * Get the portfolio stats for a given year
 * @param portfolioId Portfolio ID
 * @param year Year of the stats: 2020, 2021, etc. or 'all'
 * @param otherOptions
 * @returns A IPortfolioYearStats object
 */
export function usePortfolioYearStatsByMonth(
  portfolioId: number | undefined,
  year: string | undefined,
  otherOptions?: any,
) {
  return useQuery<IPortfolioYearStats[], Error>({
    queryKey: ["portfolioYearStats", portfolioId, year, "grouped-by-month"],
    queryFn: () => fetchYearStatsByMonth(portfolioId, year),
    enabled: !!portfolioId && !!year,
    ...otherOptions,
  });
}

/**
 * Get the portfolio stats for a given year
 * @param portfolioId Portfolio ID
 * @param year Year of the stats: 2020, 2021, etc. or 'all'
 * @param otherOptions
 * @returns A IPortfolioYearStats object
 */
export function usePortfolioYearStatsByCompany(
  portfolioId: number | undefined,
  year: string | undefined,
  otherOptions?: any,
) {
  return useQuery<IPortfolioYearStats[], Error>({
    queryKey: ["portfolioYearStats", portfolioId, year, "grouped-by-company"],
    queryFn: () => fetchYearStatsByCompany(portfolioId, year),
    enabled: !!portfolioId && !!year,
    ...otherOptions,
  });
}

export function usePortfolioAllYearStats(
  portfolioId: number | undefined,
  otherOptions?: any,
) {
  return useQuery<IPortfolioYearStats[], Error>({
    queryKey: ["portfolioAllYearsStats", portfolioId],
    queryFn: () => fetchAllYearsStats(portfolioId),

    enabled: !!portfolioId,
    ...otherOptions,
  });
}

interface MutateProps {
  onSuccess?: Function;
  onError?: Function;
}

interface IUpdateYearStatsMutationProps {
  portfolioId: number | undefined;
  year: string | undefined;
  updateApiPrice: boolean | undefined;
  companiesIds?: number[];
}

export const useUpdatePortfolioYearStats = (props?: MutateProps) => {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({
      portfolioId,
      year,
      updateApiPrice,
      companiesIds,
    }: IUpdateYearStatsMutationProps) => {
      let companiesIdsQuery = "";
      if (companiesIds) {
        companiesIdsQuery = `?companiesIds=${companiesIds.join(",")}`;
      }

      return apiClient.put(
        `/stats/portfolio/${portfolioId}/year/${year}/${companiesIdsQuery}`,
        {
          updateApiPrice,
        },
      );
    },
    onSuccess: (data, variables) => {
      props?.onSuccess?.();
      notifications.show({
        color: "green",
        message: t("Portfolio stats update requested"),
      });
      queryClient.invalidateQueries({
        queryKey: ["portfolioYearStats", variables.portfolioId, variables.year],
      });
    },
    onError: () => {
      props?.onError?.();
      notifications.show({
        color: "red",
        message: t("Portfolio stats update failed"),
      });
    },
  });
};
