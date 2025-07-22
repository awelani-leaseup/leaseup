"use client";

import {
  APILoadingStatus,
  useApiLoadingStatus,
} from "@vis.gl/react-google-maps";

export function useApiIsLoaded(): boolean {
  const status = useApiLoadingStatus();

  return status === APILoadingStatus.LOADED;
}
