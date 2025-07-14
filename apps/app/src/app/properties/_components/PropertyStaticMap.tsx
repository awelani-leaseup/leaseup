"use client";

import { createStaticMapsUrl, StaticMap } from "@vis.gl/react-google-maps";

export const PropertyStaticMap = ({ address }: { address: string }) => {
  const staticMapsUrl = createStaticMapsUrl({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    scale: 2,
    width: 200,
    height: 200,
    center: address,
    zoom: 17,
    language: "en",
  });
  return (
    <StaticMap
      className="map shadow-md` h-full w-56 rounded-l-md object-cover"
      url={staticMapsUrl}
    />
  );
};
