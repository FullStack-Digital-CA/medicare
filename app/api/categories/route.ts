import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serviceCategories, categoryFormSchema } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { asc } from "drizzle-orm";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Public endpoint - no authentication required
// This allows external websites to fetch categories for display
export async function GET() {
  try {
    const categories = await db
      .select()
      .from(serviceCategories)
      .orderBy(asc(serviceCategories.displayOrder), asc(serviceCategories.title));

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
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
    const validatedData = categoryFormSchema.parse(body);

    const slug = generateSlug(validatedData.title);

    const [newCategory] = await db
      .insert(serviceCategories)
      .values({
        title: validatedData.title,
        slug: slug,
        description: validatedData.description || "",
        icon: validatedData.icon || null,
        isActive: validatedData.isActive,
        displayOrder: validatedData.displayOrder,
      })
      .returning();

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
