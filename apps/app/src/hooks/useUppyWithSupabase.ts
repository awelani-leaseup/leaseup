import { useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import Uppy from "@uppy/core";
import Tus from "@uppy/tus";

const projectURL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const useUppyWithSupabase = ({ bucketName }: { bucketName: string }) => {
  const uppyRef = useRef<Uppy | null>(null);

  if (!uppyRef.current) {
    uppyRef.current = new Uppy();
  }

  const uppy = uppyRef.current;
  const supabase = createClient(projectURL, anonKey);

  useEffect(() => {
    const initializeUppy = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // ✅ Check if Tus already exists before registering
      if (!uppy.getPlugin("Tus")) {
        uppy
          .use(Tus, {
            id: "Tus", // not necessary, but matches default name
            endpoint: `${projectURL}/storage/v1/upload/resumable`,
            retryDelays: [0, 3000, 5000, 10000, 20000],
            headers: {
              authorization: `Bearer ${session?.access_token}`,
              apikey: anonKey,
            },
            uploadDataDuringCreation: true,
            removeFingerprintOnSuccess: true,
            chunkSize: 6 * 1024 * 1024,
            allowedMetaFields: [
              "bucketName",
              "objectName",
              "contentType",
              "cacheControl",
            ],
            onError: (error) => console.error("Upload error:", error),
          })
          .on("file-added", (file) => {
            file.meta = {
              ...file.meta,
              bucketName,
              objectName: file.name,
              contentType: file.type,
            };
          });
      }
    };

    initializeUppy();

    return () => {
      uppy.destroy();
    };
  }, [bucketName, supabase, uppy]);

  return uppy;
};
