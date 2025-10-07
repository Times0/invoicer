import { createFileRoute, Link } from "@tanstack/react-router";
import type { Doc } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getFaviconUrl } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/companies/")({
	component: Companies,
});

function CompanyCard({ company }: { company: Doc<"companies"> }) {
	const favicon = getFaviconUrl(company.website || "");
	return (
		<Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<div className="flex items-center gap-2 bg-muted rounded-full p-1">
						{favicon ? (
							<img src={favicon} alt="Favicon" className="h-5 w-5 rounded" />
						) : (
							<Building2 className="h-5 w-5 text-muted-foreground" />
						)}
					</div>
					{company.name}
				</CardTitle>
				<CardDescription>{company.email}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-1 text-sm">
					<p className="text-muted-foreground">{company.address}</p>
					<p className="text-muted-foreground">
						{company.city} {company.zip}
					</p>
					{company.website && (
						<p className="text-primary hover:underline">{company.website}</p>
					)}
					{company.siret && (
						<p className="text-muted-foreground text-xs">
							SIRET: {company.siret}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function Companies() {
	const companies = useQuery(api.companies.list);

	return (
		<div className="max-w-7xl mx-auto py-6">
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Companies</h1>
						<p className="text-muted-foreground">Manage your companies here</p>
					</div>
					<Button asChild>
						<Link to="/companies/new">
							<Plus />
							New Company
						</Link>
					</Button>
				</div>

				{companies === undefined ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{[1, 2, 3].map((i) => (
							<Card key={i} className="animate-pulse">
								<CardHeader>
									<div className="h-6 bg-muted rounded w-2/3" />
									<div className="h-4 bg-muted rounded w-1/2" />
								</CardHeader>
							</Card>
						))}
					</div>
				) : companies.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg">
						<Building2 className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">No companies yet</h3>
						<p className="text-muted-foreground text-center mb-4">
							Get started by creating your first company
						</p>
						<Button asChild>
							<Link to="/companies/new">
								<Plus />
								New Company
							</Link>
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{companies.map((company) => (
							<Link
								key={company._id}
								to="/companies/$companyId/edit"
								params={{ companyId: company._id }}
								className="block transition-transform hover:scale-[1.02]"
							>
								<CompanyCard company={company} />
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
