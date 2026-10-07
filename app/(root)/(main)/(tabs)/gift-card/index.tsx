import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList } from "react-native";
import { AddButton } from "@/components/Buttons/add-button";
import { GiftCard } from "@/components/Cards/gift-card";
import { ListEmptyComponent } from "@/components/list-empty";
import {
	WorkspaceListFooter,
	WorkspaceScreen,
	workspaceStyles,
} from "@/components/workspace/screen";
import { api } from "@/convex/_generated/api";
import { useAuthorization } from "@/hooks/use-authorization";

export default function GiftCardRoute() {
	const router = useRouter();
	const { isAuthorized } = useAuthorization();
	const giftCards = useQuery(api.giftCards.list);
	const sortedGiftCards = useMemo(
		() =>
			giftCards
				? [...giftCards]
						.sort((a, b) => a.code.localeCompare(b.code))
						.sort((a, b) => {
							if (a.balance === 0 && b.balance !== 0) return 1;
							if (a.balance !== 0 && b.balance === 0) return -1;
							return 0;
						})
				: [],
		[giftCards],
	);
	return (
		<WorkspaceScreen
			title="Gift Cards"
			description="Gift card balances at a glance."
			mobileAction={
				isAuthorized
					? {
							label: "Create gift card",
							icon: "plus",
							onPress: () => router.navigate("/gift/create"),
						}
					: undefined
			}
			actions={
				isAuthorized ? (
					<AddButton
						desktopOnly
						label="Create gift card"
						onPress={() => router.navigate("/gift/create")}
					/>
				) : null
			}
		>
			<FlatList
				contentContainerStyle={workspaceStyles.list}
				ListFooterComponent={WorkspaceListFooter}
				data={sortedGiftCards}
				renderItem={({ item }) => (
					<GiftCard overview giftCard={item} isAuthorized={isAuthorized} />
				)}
				keyExtractor={(item) => item._id.toString()}
				ListEmptyComponent={
					<ListEmptyComponent
						item="gift card"
						loading={giftCards === undefined}
					/>
				}
			/>
		</WorkspaceScreen>
	);
}
