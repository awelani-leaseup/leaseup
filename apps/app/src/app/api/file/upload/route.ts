import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@leaseup/trpc/auth";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        return {
          allowedContentTypes: [
            "image/*",
            "application/pdf",
            "text/plain",
            "text/csv",
            "application/octet-stream",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            clientPayload,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          const payload = JSON.parse(tokenPayload || "{}");
          const { userId } = payload;

          console.log(`File uploaded by user ${userId}:`, blob.url);

          // Here you can run any logic after the file upload completed
          // For example, save the file info to your database:
          // await db.file.create({
          //   data: {
          //     url: blob.url,
          //     filename: blob.pathname,
          //     size: blob.size,
          //     contentType: blob.contentType,
          //     userId: userId,
          //   }
          // });
        } catch (error) {
          console.error("Error in onUploadCompleted:", error);
          // Don't throw here as it would cause the upload to appear failed
          // even though the file was successfully uploaded
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error in file upload handler:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}
