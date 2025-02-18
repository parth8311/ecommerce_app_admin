import Collection from "@/lib/models/Collection";
import { connectToDB } from "@/lib/mongoDB";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) => {
  try {
    await connectToDB();

    const collection = await Collection.findById(params.collectionId);

    if (!collection) {
      return new NextResponse(
        JSON.stringify({
          message: "Collection Not Found",
        }),
        {
          status: 404,
        }
      );
    }
    return NextResponse.json(collection, { status: 200 });
  } catch (error) {
    console.log("[collectionId_GET]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
};

export const POST = async (
  req: NextRequest,
  {
    params,
  }: {
    params: {
      collectionId: string;
    };
  }
) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    await connectToDB();

    let collection = await Collection.findById(params.collectionId);

    if (!collection) {
      return new NextResponse("Collection Not Found", {
        status: 404,
      });
    }

    const { title, description, image } = await req.json();

    if (!title || !image) {
      return new NextResponse("Title and image are required", {
        status: 400,
      });
    }

    collection = await Collection.findByIdAndUpdate(
      params.collectionId,
      {
        title,
        description,
        image,
      },
      {
        new: true,
      }
    );

    await collection.save();

    return NextResponse.json(collection, {
      status: 200,
    });
  } catch (error) {
    console.log("[collectionId_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  {
    params,
  }: {
    params: {
      collectionId: string;
    };
  }
) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    await Collection.findByIdAndDelete(params.collectionId);

    return new NextResponse("Collection Is Deleted", { status: 200 });
  } catch (error) {
    console.log("[collectionId_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
