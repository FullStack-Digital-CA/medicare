import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services, serviceCategories } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

// Internal endpoint for admin dashboard - requires authentication
// Returns flat list of services with category info
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
