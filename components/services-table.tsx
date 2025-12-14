"use client";

import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

interface ServicesTableProps {
  services: ServiceWithCategory[];
  isLoading: boolean;
  onEdit: (service: ServiceWithCategory) => void;
  onDelete: (service: ServiceWithCategory) => void;
}

export function ServicesTable({
  services,
  isLoading,
  onEdit,
  onDelete,
}: ServicesTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    if (remainingMins === 0) {
      return `${hours} hr${hours > 1 ? "s" : ""}`;
    }
    return `${hours} hr${hours > 1 ? "s" : ""} ${remainingMins} mins`;
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden sm:table-cell">Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden sm:table-cell">Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <p className="text-muted-foreground">
                  No services found. Add your first service to get started.
                </p>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="hidden lg:table-cell font-semibold">
                Category
              </TableHead>
              <TableHead className="hidden md:table-cell font-semibold">
                Description
              </TableHead>
              <TableHead className="font-semibold">Price</TableHead>
              <TableHead className="hidden sm:table-cell font-semibold">
                Duration
              </TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="outline" className="font-normal">
                    {service.categoryTitle || "Uncategorized"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground max-w-xs truncate">
                  {service.description || "—"}
                </TableCell>
                <TableCell className="font-medium text-primary">
                  {formatPrice(service.price)}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {formatDuration(service.duration)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={service.isActive ? "default" : "secondary"}
                    className={
                      service.isActive
                        ? "bg-emerald-500 hover:bg-emerald-600"
                        : "bg-gray-400 hover:bg-gray-500"
                    }
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(service)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(service)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
