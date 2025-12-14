"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, RefreshCw, List, Filter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ServicesTable } from "@/components/services-table";
import { ServiceModal } from "@/components/service-modal";
import { DeleteConfirmModal } from "@/components/delete-confirm-modal";
import { type ServiceCategory, type ServiceFormValues } from "@/lib/db/schema";

interface ServiceWithCategory {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  categoryId: number;
  isActive: boolean;
  categoryTitle?: string | null;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceWithCategory[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceWithCategory | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceWithCategory | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/services");
      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, [fetchCategories, fetchServices]);

  // Filter services based on selected category
  const filteredServices = useMemo(() => {
    if (selectedCategoryId === "all") {
      return services;
    }
    return services.filter(
      (service) => service.categoryId === parseInt(selectedCategoryId, 10)
    );
  }, [services, selectedCategoryId]);

  const handleAddService = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service: ServiceWithCategory) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (service: ServiceWithCategory) => {
    setServiceToDelete(service);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (data: ServiceFormValues) => {
    setIsSubmitting(true);

    try {
      const url = selectedService
        ? `/api/services/${selectedService.id}`
        : "/api/services";
      const method = selectedService ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save service");
      }

      toast.success(
        selectedService
          ? "Service updated successfully"
          : "Service created successfully"
      );

      setIsModalOpen(false);
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save service"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/services/${serviceToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete service");
      }

      toast.success("Service deleted successfully");
      setIsDeleteModalOpen(false);
      setServiceToDelete(null);
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete service"
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
            <List className="h-6 w-6 text-primary" />
            Services
          </h1>
          <p className="text-muted-foreground">
            Manage medical services offered at your facility
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchServices}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={handleAddService}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
          <SelectTrigger className="w-[200px] bg-background">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCategoryId !== "all" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategoryId("all")}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear filter
          </Button>
        )}
        <span className="ml-auto text-sm text-muted-foreground">
          Showing {filteredServices.length} of {services.length} services
        </span>
      </div>

      {/* Table */}
      <ServicesTable
        services={filteredServices}
        isLoading={isLoading}
        onEdit={handleEditService}
        onDelete={handleDeleteClick}
      />

      {/* Service Modal */}
      <ServiceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        service={selectedService}
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Service"
        description={`Are you sure you want to delete "${serviceToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
