import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useMutation, useQuery } from "convex/react";
import { Button, Chip, useThemeColor } from "heroui-native";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { api } from "@/convex/_generated/api";

export default function HomeRoute() {
	const themeColorBackground = useThemeColor("background");

	/* ------------------------------ post logic ------------------------------ */
	// const postData = useQuery(api.post.getPostsAndUsers);
	// const createPost = useMutation(api.post.createPost);
	const handleCreatePost = () => {
		const randomTitle =
			POST_TITLES[Math.floor(Math.random() * POST_TITLES.length)];
		// createPost({ title: randomTitle, status: "start" });
	};

	return (
		<View className="flex-1">
			<FlatList
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 pt-2 px-3 pb-24"
				// keyExtractor={(item) => item.post._id}
				// data={postData}
				data={[]}
				renderItem={({ item }) => <PostItem item={item} />}
			/>
			<Button
				onPress={handleCreatePost}
				className="absolute bottom-8 self-center overflow-hidden rounded-full"
			>
				<Button.Label>Create Post</Button.Label>
				<Ionicons name="add-outline" size={18} color={themeColorBackground} />
			</Button>
		</View>
	);
}

// TODO: Implement PostItem component
const POST_TITLES = [
	"Store passwords in the user’s browser and validate client-side. Just send a boolean to your server. Reduces database load by 90% and keeps sensitive data off your servers.",
	"Passwords in plain text are actually more secure because hackers expect encryption",
	"Use single character column names in your database. ‘u’ for users, ‘p’ for password, ‘e’ for email. We reduced our database size by 40% just from shorter column names.",
	"Always keep your database and application on different continents. Database in EU-North, app servers in US-West. Shared regional infrastructure creates a single point of failure.",
];

const PostItem = ({
	item,
}: {
	// TODO: Fix Type
	item: any;
	// item: FunctionReturnType<typeof api.post.getPostsAndUsers>[number];
}) => {
	const renderStatusChip = () => {
		switch (item.post.status) {
			case "start":
				return (
					<Chip layout={undefined} variant="primary" color="default">
						<View className="h-1.5 w-1.5 rounded-full bg-blue-500" />
						<Chip.Label>Started</Chip.Label>
					</Chip>
				);
			case "middle":
				return (
					<Chip layout={undefined} variant="primary" color="default">
						<View className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
						<Chip.Label>In Progress</Chip.Label>
					</Chip>
				);
			case "end":
				return (
					<Chip layout={undefined} variant="primary" color="default">
						<View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
						<Chip.Label>Completed</Chip.Label>
					</Chip>
				);
		}
	};
	return (
		<View className="gap-2 rounded-3xl border border-border bg-background p-6">
			<Text className="max-w-80 font-bold text-foreground text-lg">
				{item.post.title}
			</Text>
			<Text className="pb-1 text-muted-foreground">
				By <Text className="italic">{item.creator?.name}</Text>
			</Text>
			{renderStatusChip()}
		</View>
	);
};
