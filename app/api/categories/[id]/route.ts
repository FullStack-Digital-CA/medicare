import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serviceCategories, services, categoryFormSchema } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = categoryFormSchema.parse(body);

    const slug = generateSlug(validatedData.title);

    const [updatedCategory] = await db
      .update(serviceCategories)
      .set({
        title: validatedData.title,
        slug: slug,
        description: validatedData.description || "",
        icon: validatedData.icon || null,
        isActive: validatedData.isActive,
        displayOrder: validatedData.displayOrder,
        updatedAt: new Date(),
      })
      .where(eq(serviceCategories.id, categoryId))
      .returning();

    if (!updatedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    // Check if any services are using this category
    const servicesInCategory = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.categoryId, categoryId))
      .limit(1);

    if (servicesInCategory.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with existing services. Please reassign or delete the services first." },
        { status: 400 }
      );
    }

    const [deletedCategory] = await db
      .delete(serviceCategories)
      .where(eq(serviceCategories.id, categoryId))
      .returning();

    if (!deletedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
