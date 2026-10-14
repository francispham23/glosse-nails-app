import { Tabs } from "expo-router";
import {
	WORKSPACE_TABS,
	WorkspaceNavigation,
} from "@/components/workspace/navigation";
import { useWorkspaceLayout } from "@/hooks/use-workspace-layout";

export default function TabLayout() {
	const { isCompact } = useWorkspaceLayout();
	return (
		<Tabs
			tabBar={(props) => <WorkspaceNavigation {...props} />}
			screenOptions={{
				headerShown: false,
				tabBarPosition: isCompact ? "bottom" : "left",
			}}
		>
			{WORKSPACE_TABS.map((tab) => (
				<Tabs.Screen
					key={tab.name}
					name={tab.name}
					options={{ title: tab.title }}
				/>
			))}
		</Tabs>
	);
}
