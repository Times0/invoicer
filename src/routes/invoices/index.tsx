import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { AlertTriangle, FileText, Filter, Plus, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { InvoiceRow } from "@/components/InvoiceRow";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/invoices/")({
	component: Invoices,
});

function Invoices() {
	const invoices = useQuery(api.invoices.list);
	const companies = useQuery(api.companies.list);
	console.log(companies);
	const deleteInvoice = useMutation(api.invoices.remove);
	const navigate = useNavigate();

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [companyFilter, setCompanyFilter] = useState<string>("all");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

	const getCompany = useCallback(
		(companyId: string) => {
			return companies?.find((c) => c._id === companyId);
		},
		[companies],
	);

	const handleEdit = (invoiceId: string) => {
		navigate({ to: "/invoices/$invoiceId/edit", params: { invoiceId } });
	};

	const handleDelete = (invoiceId: string) => {
		setInvoiceToDelete(invoiceId);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (invoiceToDelete) {
			deleteInvoice({ id: invoiceToDelete as Id<"invoices"> });
			setDeleteDialogOpen(false);
			setInvoiceToDelete(null);
		}
	};

	const cancelDelete = () => {
		setDeleteDialogOpen(false);
		setInvoiceToDelete(null);
	};

	const filteredInvoices = useMemo(() => {
		if (!invoices || !companies) return [];

		return invoices.filter((invoice) => {
			const company = getCompany(invoice.companyId);

			// Search filter
			const matchesSearch =
				searchQuery === "" ||
				invoice.invoiceNumber
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				company?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				company?.email.toLowerCase().includes(searchQuery.toLowerCase());

			// Status filter
			const matchesStatus =
				statusFilter === "all" || invoice.status === statusFilter;

			// Client filter
			const matchesCompany =
				companyFilter === "all" || invoice.companyId === companyFilter;

			return matchesSearch && matchesStatus && matchesCompany;
		});
	}, [
		invoices,
		companies,
		searchQuery,
		statusFilter,
		companyFilter,
		getCompany,
	]);

	return (
		<div className="max-w-7xl mx-auto py-6">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
						<p className="text-muted-foreground">
							Manage and track all your invoices
						</p>
					</div>
					<Button asChild>
						<Link to="/invoices/new">
							<Plus />
							New Invoice
						</Link>
					</Button>
				</div>

				{/* Filters */}
				{invoices !== undefined && invoices.length > 0 && (
					<div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center p-vertical-4 rounded-lg">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								autoComplete="new-password"
								data-lpignore="true"
								data-form-type="other"
								type="text"
								placeholder="Search by invoice number, client name, or email..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9 bg-background"
							/>
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-full sm:w-[180px] bg-background">
								<Filter className="h-4 w-4 mr-2" />
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="sent">Sent</SelectItem>
								<SelectItem value="paid">Paid</SelectItem>
								<SelectItem value="overdue">Overdue</SelectItem>
								<SelectItem value="cancelled">Cancelled</SelectItem>
							</SelectContent>
						</Select>
						<Select value={companyFilter} onValueChange={setCompanyFilter}>
							<SelectTrigger className="w-full sm:w-[200px] bg-background">
								<Filter className="h-4 w-4 mr-2" />
								<SelectValue placeholder="Client" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Clients</SelectItem>
								{companies?.map((company) => (
									<SelectItem key={company._id} value={company._id}>
										{company.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{/* Loading State */}
				{invoices === undefined || companies === undefined ? (
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-32 bg-muted/50 rounded-lg animate-pulse"
							/>
						))}
					</div>
				) : invoices.length === 0 ? (
					/* Empty State */
					<div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg bg-muted/20">
						<FileText className="h-16 w-16 text-muted-foreground mb-4" />
						<h3 className="text-xl font-semibold mb-2">No invoices yet</h3>
						<p className="text-muted-foreground text-center mb-6">
							Get started by creating your first invoice
						</p>
						<Button asChild size="lg">
							<Link to="/invoices/new">
								<Plus />
								Create Invoice
							</Link>
						</Button>
					</div>
				) : filteredInvoices.length === 0 ? (
					/* No Results */
					<div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg bg-muted/20">
						<Search className="h-16 w-16 text-muted-foreground mb-4" />
						<h3 className="text-xl font-semibold mb-2">No results found</h3>
						<p className="text-muted-foreground text-center mb-6">
							Try adjusting your filters or search query
						</p>
						<Button
							variant="outline"
							onClick={() => {
								setSearchQuery("");
								setStatusFilter("all");
								setCompanyFilter("all");
							}}
						>
							Clear Filters
						</Button>
					</div>
				) : (
					/* Invoice List */
					<div className="space-y-3">
						{filteredInvoices.map((invoice) => {
							const company = getCompany(invoice.companyId);

							return (
								<InvoiceRow
									key={invoice._id}
									invoice={invoice}
									company={company}
									onEdit={handleEdit}
									onDelete={handleDelete}
								/>
							);
						})}
					</div>
				)}
			</div>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-destructive" />
							Delete Invoice
						</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this invoice? This action cannot
							be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={cancelDelete}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={confirmDelete}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
