import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services, serviceCategories, serviceFormSchema } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Public endpoint - no authentication required
// This allows external websites to fetch services for display
export async function GET() {
  try {
    // Join services with categories to get category title
    const allServices = await db
      .select({
        id: services.id,
        name: services.name,
        slug: services.slug,
        description: services.description,
        shortDescription: services.shortDescription,
        price: services.price,
        duration: services.duration,
        categoryId: services.categoryId,
        categoryTitle: serviceCategories.title,
        imageUrl: services.imageUrl,
        isActive: services.isActive,
        displayOrder: services.displayOrder,
        createdAt: services.createdAt,
        updatedAt: services.updatedAt,
      })
      .from(services)
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .orderBy(desc(services.createdAt));

    return NextResponse.json(allServices);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = serviceFormSchema.parse(body);

    const slug = generateSlug(validatedData.name);

    const [newService] = await db
      .insert(services)
      .values({
        name: validatedData.name,
        slug: slug,
        description: validatedData.description || "",
        price: validatedData.price,
        duration: validatedData.duration,
        categoryId: validatedData.categoryId,
        isActive: validatedData.isActive,
      })
      .returning();

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
