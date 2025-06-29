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
    markers: [
      {
        location: address,
      },
    ],
  });
  return (
    <StaticMap
      className="map shadow-md` h-[6rem] max-h-[6rem] rounded-md"
      url={staticMapsUrl}
    />
  );
};
