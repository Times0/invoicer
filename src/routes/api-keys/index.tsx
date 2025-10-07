import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/api-keys/")({
	component: RouteComponent,
});

function RouteComponent() {
	const createApiKey = useMutation(api.apiKeys.create);
	const [apiKey, setApiKey] = useState("");

	const handleCreateApiKey = async () => {
		const apiKey = await createApiKey();
		setApiKey(apiKey);
	};

	return (
		<div className="flex flex-col items-start gap-4 max-w-md mx-auto mt-10">
			<Button onClick={handleCreateApiKey} className="w-full">
				Create API Key
			</Button>
			<div className="w-full">
				<label className="block text-sm font-medium mb-1" htmlFor={useId()}>
					Your API Key
				</label>
				<Input
					id={useId()}
					value={apiKey}
					readOnly
					className="w-full font-mono bg-muted"
					placeholder="No API key generated yet"
				/>
			</div>
		</div>
	);
}
