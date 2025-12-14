"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, RefreshCw, FolderTree } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CategoriesTable } from "@/components/categories-table";
import { CategoryModal } from "@/components/category-modal";
import { DeleteConfirmModal } from "@/components/delete-confirm-modal";
import { type ServiceCategory, type CategoryFormValues } from "@/lib/db/schema";

interface ServiceWithCategory {
  id: number;
  categoryId: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<ServiceWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<ServiceCategory | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch("/api/services");
      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, [fetchCategories, fetchServices]);

  // Calculate service counts per category
  const serviceCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    services.forEach((service) => {
      counts[service.categoryId] = (counts[service.categoryId] || 0) + 1;
    });
    return counts;
  }, [services]);

  // Calculate max display order for new categories
  const maxDisplayOrder = useMemo(() => {
    if (categories.length === 0) return -1;
    return Math.max(...categories.map((c) => c.displayOrder));
  }, [categories]);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (category: ServiceCategory) => {
    const count = serviceCounts[category.id] || 0;
    if (count > 0) {
      toast.error(`Cannot delete category with ${count} service(s). Please reassign them first.`);
      return;
    }
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);

    try {
      const url = selectedCategory
        ? `/api/categories/${selectedCategory.id}`
        : "/api/categories";
      const method = selectedCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save category");
      }

      toast.success(
        selectedCategory
          ? "Category updated successfully"
          : "Category created successfully"
      );

      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save category"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete category");
      }

      toast.success("Category deleted successfully");
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-primary" />
            Service Categories
          </h1>
          <p className="text-muted-foreground">
            Organize your medical services into categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { fetchCategories(); fetchServices(); }}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={handleAddCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
          <p className="text-2xl font-bold">{categories.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Active Categories</p>
          <p className="text-2xl font-bold text-emerald-600">
            {categories.filter((c) => c.isActive).length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Total Services</p>
          <p className="text-2xl font-bold text-primary">{services.length}</p>
        </div>
      </div>

      {/* Table */}
      <CategoriesTable
        categories={categories}
        serviceCounts={serviceCounts}
        isLoading={isLoading}
        onEdit={handleEditCategory}
        onDelete={handleDeleteClick}
      />

      {/* Category Modal */}
      <CategoryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        category={selectedCategory}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        maxDisplayOrder={maxDisplayOrder}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
