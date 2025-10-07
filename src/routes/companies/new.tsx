import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { CompanyForm } from "@/components/CompanyForm";
import { Button } from "@/components/ui/button";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/companies/new")({
	component: NewCompany,
});

function NewCompany() {
	const navigate = useNavigate();
	const addCompany = useMutation(api.companies.add);
	const [isSubmitting, setIsSubmitting] = useState(false);

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
			await addCompany(data);
			navigate({ to: "/companies" });
		} catch (error) {
			console.error("Failed to create company:", error);
			alert("Failed to create company. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

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
						<h1 className="text-3xl font-bold tracking-tight">New Company</h1>
						<p className="text-muted-foreground">
							Create a new company to manage invoices
						</p>
					</div>
				</div>

				<CompanyForm
					onSubmit={handleSubmit}
					isSubmitting={isSubmitting}
					submitLabel="Create Company"
				/>
			</div>
		</div>
	);
}
