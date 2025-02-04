import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MRT_PaginationState } from "mantine-react-table";
import { apiClient } from "api/api-client";
import queryClient from "api/query-client";
import { IBenchmark, IBenchmarkFormFields } from "types/benchmark";

interface UpdateMutationProps {
  newBenchmark: IBenchmarkFormFields;
  id: number | undefined;
}

type BenchmarksApiResponse = {
  results: Array<IBenchmark>;
  count: number;
  next: number | null;
  previous: number | null;
};

interface Params {
  pagination: MRT_PaginationState;
  otherOptions?: any;
}

export const fetchBenchmarks = async (pagination: MRT_PaginationState) => {
  const fetchURL = new URL("benchmarks/", apiClient.defaults.baseURL);

  fetchURL.searchParams.set(
    "offset",
    `${pagination.pageIndex * pagination.pageSize}`,
  );
  fetchURL.searchParams.set("limit", `${pagination.pageSize}`);
  const { data } = await apiClient.get<BenchmarksApiResponse>(fetchURL.href);
  return data;
};

export function useBenchmarks({
  pagination,
  otherOptions = undefined,
}: Params) {
  return useQuery<BenchmarksApiResponse, Error>({
    queryKey: ["benchmarks", pagination],
    queryFn: () => fetchBenchmarks(pagination),
    ...otherOptions,
  });
}

export const fetchAllBenchmarks = async () => {
  const fetchURL = new URL("benchmarks/", apiClient.defaults.baseURL);

  const { data } = await apiClient.get<IBenchmark[]>(fetchURL.href);
  return data;
};

export function useAllBenchmarks() {
  return useQuery<IBenchmark[], Error>({
    queryKey: ["benchmarks"],
    queryFn: fetchAllBenchmarks,
  });
}

export const fetchBenchmarkValues = async (id: number | undefined) => {
  const fetchURL = new URL(`benchmarks/${id}/`, apiClient.defaults.baseURL);

  const { data } = await apiClient.get<IBenchmark[]>(fetchURL.href);
  return data;
};

export function useBenchmarkValues(id: number | undefined, otherOptions?: any) {
  return useQuery<IBenchmark>({
    queryKey: ["benchmarks", id],
    queryFn: () => fetchBenchmarkValues(id),
    enabled: !!id,
    ...otherOptions,
  });
}

export const fetchBenchmark = async (id: number | undefined) => {
  if (!id) {
    throw new Error("Id is required");
  }
  const fetchURL = new URL(`benchmarks/${id}/`, apiClient.defaults.baseURL);

  const { data } = await apiClient.get<IBenchmark>(fetchURL.href);
  return data;
};

export function useBenchmark(id: number | undefined, options?: any) {
  return useQuery<IBenchmark, Error>({
    queryKey: ["benchmarks", id],
    queryFn: () => fetchBenchmark(id),
    enabled: !!id,
    ...options,
  });
}

interface MutateProps {
  onSuccess?: Function;
  onError?: Function;
}

export const useAddBenchmark = (props?: MutateProps) => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (newBenchmark: IBenchmarkFormFields) => {
      const fetchURL = new URL(`benchmarks/`, apiClient.defaults.baseURL);
      return apiClient.post(fetchURL.href, newBenchmark);
    },
    onSuccess: () => {
      props?.onSuccess?.();
      notifications.show({
        color: "green",
        message: t("Benchmark created"),
      });
      queryClient.invalidateQueries({ queryKey: ["benchmarks"] });
    },
    onError: () => {
      props?.onError?.();
      notifications.show({
        color: "red",
        message: t("Unable to create benchmark"),
      });
    },
  });
};

export const useDeleteBenchmark = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/benchmarks/${id}/`),
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: t("Benchmark deleted"),
      });
      queryClient.invalidateQueries({ queryKey: ["benchmarks"] });
    },
    onError: () => {
      notifications.show({
        color: "red",
        message: t("Unable to delete benchmark"),
      });
    },
  });
};

export const useUpdateBenchmark = (props?: MutateProps) => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, newBenchmark }: UpdateMutationProps) =>
      apiClient.put(`/benchmarks/${id}/`, newBenchmark),
    onSuccess: () => {
      props?.onSuccess?.();
      notifications.show({
        color: "green",
        message: t("Benchmark has been updated"),
      });
      queryClient.invalidateQueries({ queryKey: ["benchmarks"] });
    },
    onError: () => {
      props?.onError?.();
      notifications.show({
        color: "red",
        message: t("Unable to update benchmark"),
      });
    },
  });
};

export const useInitializeBenchmarks = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () =>
      apiClient.post<IBenchmark[]>(`/initialize-data/benchmarks/`),

    onSuccess: () => {
      notifications.show({
        color: "green",
        message: t("Benchmarks created"),
      });
      queryClient.invalidateQueries({ queryKey: ["benchmarks"] });
    },
    onError: () => {
      notifications.show({
        color: "red",
        message: t("Unable to create benchmarks"),
      });
    },
  });
};
