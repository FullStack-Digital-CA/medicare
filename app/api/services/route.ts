import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services, serviceCategories, serviceFormSchema } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { asc, desc, eq } from "drizzle-orm";

const ALLOWED_ORIGIN = "https://www.sintamedicalcenter.ae";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// Public endpoint - no authentication required
// Returns categories with nested services for external website display
export async function GET() {
  try {
    // Fetch all categories
    const allCategories = await db
      .select()
      .from(serviceCategories)
      .orderBy(asc(serviceCategories.displayOrder), asc(serviceCategories.title));

    // Fetch all services
    const allServices = await db
      .select()
      .from(services)
      .orderBy(asc(services.displayOrder), desc(services.createdAt));

    // Group services by category
    const categoriesWithServices = allCategories.map((category) => ({
      id: category.id,
      title: category.title,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      services: allServices
        .filter((service) => service.categoryId === category.id)
        .map((service) => ({
          id: service.id,
          categoryId: service.categoryId,
          name: service.name,
          slug: service.slug,
          description: service.description,
          shortDescription: service.shortDescription,
          price: service.price?.toString() || "0.00",
          duration: service.duration,
          displayOrder: service.displayOrder,
          isActive: service.isActive,
          imageUrl: service.imageUrl || "",
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
        })),
    }));

    return NextResponse.json(categoriesWithServices, { headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500, headers: corsHeaders }
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
