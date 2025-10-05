import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CompanyForm } from "@/components/CompanyForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/companies/$companyId/edit")({
  component: EditCompany,
});

function EditCompany() {
  const { companyId } = Route.useParams();
  const navigate = useNavigate();
  const company = useQuery(api.companies.get, {
    id: companyId as Id<"companies">,
  });
  const editCompany = useMutation(api.companies.edit);
  const removeCompany = useMutation(api.companies.remove);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (data: {
    name: string;
    siret: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    website: string;
    isMyCompany?: boolean;
  }) => {
    try {
      setIsSubmitting(true);
      await editCompany({
        id: companyId as Id<"companies">,
        ...data,
      });
      navigate({ to: "/companies" });
    } catch (error) {
      console.error("Failed to update company:", error);
      alert("Failed to update company. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this company?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await removeCompany({ id: companyId as Id<"companies"> });
      navigate({ to: "/companies" });
    } catch (error) {
      console.error("Failed to delete company:", error);
      alert("Failed to delete company. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (company === undefined) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/companies" })}
            >
              <ArrowLeft />
            </Button>
            <div>
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-64 bg-muted rounded animate-pulse" />
            <div className="h-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (company === null) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/companies" })}
            >
              <ArrowLeft />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Company Not Found
              </h1>
              <p className="text-muted-foreground">
                The company you're looking for doesn't exist
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/companies" })}
          >
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Company</h1>
            <p className="text-muted-foreground">
              Update {company.name}'s information
            </p>
          </div>
        </div>

        <CompanyForm
          initialData={{
            name: company.name,
            siret: company.siret,
            email: company.email,
            address: company.address,
            city: company.city,
            zip: company.zip,
            website: company.website,
            isMyCompany: company.isMyCompany,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Update Company"
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
