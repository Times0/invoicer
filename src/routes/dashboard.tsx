import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowDownRight,
	ArrowUpRight,
	Clock,
	DollarSign,
	FileText,
	TrendingUp,
	Users,
} from "lucide-react";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/dashboard")({
	component: Dashboard,
});

// Mock data for charts
const revenueData = [
	{ month: "Jan", revenue: 12500, invoices: 24 },
	{ month: "Feb", revenue: 15300, invoices: 28 },
	{ month: "Mar", revenue: 14200, invoices: 26 },
	{ month: "Apr", revenue: 18900, invoices: 32 },
	{ month: "May", revenue: 21500, invoices: 38 },
	{ month: "Jun", revenue: 19800, invoices: 35 },
];

const recentInvoices = [
	{
		id: "INV-001",
		client: "Acme Corp",
		amount: 2500,
		status: "Paid",
		date: "2025-10-01",
	},
	{
		id: "INV-002",
		client: "TechStart Inc",
		amount: 1800,
		status: "Pending",
		date: "2025-10-02",
	},
	{
		id: "INV-003",
		client: "Global Solutions",
		amount: 3200,
		status: "Paid",
		date: "2025-10-03",
	},
	{
		id: "INV-004",
		client: "Digital Agency",
		amount: 1500,
		status: "Overdue",
		date: "2025-09-28",
	},
	{
		id: "INV-005",
		client: "Smart Systems",
		amount: 4100,
		status: "Paid",
		date: "2025-10-04",
	},
];

function Dashboard() {
	return (
		<div className="flex-1 space-y-6 p-8">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">
					Welcome to your invoice management system
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$102,200</div>
						<p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
							<TrendingUp className="h-3 w-3 text-green-500" />
							<span className="text-green-500">+12.5%</span> from last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Invoices
						</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">183</div>
						<p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
							<ArrowUpRight className="h-3 w-3 text-green-500" />
							<span className="text-green-500">+8</span> from last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Clients
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">42</div>
						<p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
							<ArrowUpRight className="h-3 w-3 text-green-500" />
							<span className="text-green-500">+3</span> from last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Pending Amount
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$18,450</div>
						<p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
							<ArrowDownRight className="h-3 w-3 text-red-500" />
							<span className="text-red-500">-5.2%</span> from last month
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Charts Row */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				{/* Revenue Chart */}
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Revenue Overview</CardTitle>
						<CardDescription>
							Monthly revenue and invoice count for the last 6 months
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={revenueData}>
								<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
								<XAxis
									dataKey="month"
									className="text-xs"
									tick={{ fill: "hsl(var(--muted-foreground))" }}
								/>
								<YAxis
									className="text-xs"
									tick={{ fill: "hsl(var(--muted-foreground))" }}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: "hsl(var(--card))",
										border: "1px solid hsl(var(--border))",
										borderRadius: "8px",
									}}
								/>
								<Legend />
								<Line
									type="monotone"
									dataKey="revenue"
									stroke="hsl(var(--primary))"
									strokeWidth={2}
									name="Revenue ($)"
								/>
								<Line
									type="monotone"
									dataKey="invoices"
									stroke="hsl(var(--muted-foreground))"
									strokeWidth={2}
									name="Invoices"
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Invoice Status Pie Chart */}
				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Invoice Status</CardTitle>
						<CardDescription>Distribution of invoice statuses</CardDescription>
					</CardHeader>
					<CardContent className="flex items-center justify-center"></CardContent>
				</Card>
			</div>

			{/* Recent Invoices Table */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Invoices</CardTitle>
					<CardDescription>Your most recent invoice activity</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{recentInvoices.map((invoice) => (
							<div
								key={invoice.id}
								className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
							>
								<div className="space-y-1">
									<p className="text-sm font-medium">{invoice.id}</p>
									<p className="text-sm text-muted-foreground">
										{invoice.client}
									</p>
								</div>
								<div className="flex items-center gap-4">
									<div className="text-right">
										<p className="text-sm font-medium">
											${invoice.amount.toLocaleString()}
										</p>
										<p className="text-xs text-muted-foreground">
											{invoice.date}
										</p>
									</div>
									<span
										className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
											invoice.status === "Paid"
												? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
												: invoice.status === "Pending"
													? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
													: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
										}`}
									>
										{invoice.status}
									</span>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Additional Stats Row */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Average Invoice Value</CardTitle>
						<CardDescription>Per invoice this month</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">$558</div>
						<p className="text-xs text-muted-foreground mt-2">
							Based on 35 invoices sent
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Payment Rate</CardTitle>
						<CardDescription>On-time payments</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">87%</div>
						<p className="text-xs text-muted-foreground mt-2">
							3% improvement from last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Outstanding Invoices</CardTitle>
						<CardDescription>Awaiting payment</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">12</div>
						<p className="text-xs text-muted-foreground mt-2">
							Total value: $18,450
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
