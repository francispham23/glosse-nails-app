import { useRouter } from "expo-router";
import { useState } from "react";
import { Button } from "react-native-paper";
import { DateControl } from "@/components/workspace/date-control";
import { WorkspaceSheet } from "@/components/workspace/sheet";
import { useAppDate } from "@/contexts/app-date-context";

export default function PickDateRoute() {
	const router = useRouter();
	const { date, setDate } = useAppDate();
	const [draft, setDraft] = useState(date);
	return (
		<WorkspaceSheet
			visible
			title="Choose date"
			onClose={() => router.dismiss()}
			actions={
				<>
					<Button
						onPress={() => router.dismiss()}
						contentStyle={{ minHeight: 48 }}
					>
						Cancel
					</Button>
					<Button
						mode="contained"
						contentStyle={{ minHeight: 48 }}
						onPress={() => {
							setDate(draft);
							router.dismiss();
						}}
					>
						Apply date
					</Button>
				</>
			}
		>
			<DateControl
				label="Overview date"
				value={draft}
				maximumDate={new Date()}
				onChange={setDraft}
			/>
		</WorkspaceSheet>
	);
}
