import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Text, useTheme } from "react-native-paper";
import Animated from "react-native-reanimated";
import { AddButton } from "@/components/Buttons/add-button";
import { TechnicianCard } from "@/components/Cards/technician-card";
import { ListEmptyComponent } from "@/components/list-empty";
import {
	WorkspaceListFooter,
	WorkspaceScreen,
	workspaceStyles,
} from "@/components/workspace/screen";
import { useAppDate } from "@/contexts/app-date-context";
import { api } from "@/convex/_generated/api";
import { useAuthorization } from "@/hooks/use-authorization";
import { getErrorMessage, isToday, type User } from "@/utils";

export default function HomeRoute() {
	const { colors } = useTheme();
	const [saveError, setSaveError] = useState("");
	const [saving, setSaving] = useState(false);
	const saveLock = useRef(false);
	const { startOfDay, endOfDay } = useAppDate();
	const { isAuthorized: isAuthUser, user } = useAuthorization();

	// Query Convex only when not showing today's data
	const technicians = useQuery(api.users.usersByDateRange, {
		startDate: startOfDay.getTime(),
		endDate: endOfDay.getTime(),
	});

	// Query shift for the selected date
	const onShiftTechs = useQuery(api.shifts.getShiftByDate, {
		shiftDate: startOfDay.getTime(),
	});

	// Mutation to save shift
	const saveShift = useMutation(api.shifts.saveShift);

	const [selection, setSelection] = useState<{
		shiftDate: number;
		ids: User["_id"][];
	} | null>(null);
	const shiftDate = startOfDay.getTime();
	const isSelecting = selection?.shiftDate === shiftDate;
	const selectedTechnicians = useMemo(() => {
		const ids = new Set(
			isSelecting ? selection.ids : onShiftTechs?.map((tech) => tech._id),
		);
		return technicians?.filter((tech) => ids.has(tech._id)) ?? [];
	}, [isSelecting, selection, onShiftTechs, technicians]);

	const isSelectedDateToday = useMemo(
		() => isToday(endOfDay.getTime()),
		[endOfDay],
	);

	const filteredSelectedTechnicians = useMemo(() => {
		const isOnShift = onShiftTechs?.some((tech) => tech._id === user?._id);
		return selectedTechnicians.filter((tech) =>
			(isOnShift && isSelectedDateToday) || isAuthUser
				? true
				: tech._id === user?._id,
		);
	}, [
		selectedTechnicians,
		isAuthUser,
		isSelectedDateToday,
		user?._id,
		onShiftTechs,
	]);

	const data = useMemo(
		() => (isSelecting ? technicians : filteredSelectedTechnicians),
		[isSelecting, technicians, filteredSelectedTechnicians],
	);

	const renderItem = useCallback(
		({ item }: { item: User }) => {
			const isSelected = selectedTechnicians.some((u) => u._id === item._id);
			const isAuthorized =
				isAuthUser || (user?._id === item._id && isSelectedDateToday);

			const onToggleSelect = (user: User) => {
				setSelection((current) => {
					if (saveLock.current || !current || current.shiftDate !== shiftDate)
						return current;
					return {
						...current,
						ids: current.ids.includes(user._id)
							? current.ids.filter((id) => id !== user._id)
							: [...current.ids, user._id],
					};
				});
			};

			return (
				<TechnicianCard
					overview
					interactionDisabled={saving}
					key={item._id}
					item={item}
					isSelecting={isSelecting}
					isSelected={isSelected}
					isAuthorized={isAuthorized}
					onToggleSelect={onToggleSelect}
				/>
			);
		},
		[
			selectedTechnicians,
			isSelecting,
			isAuthUser,
			user?._id,
			isSelectedDateToday,
			shiftDate,
			saving,
		],
	);

	const keyExtractor = useCallback((item: User) => item._id.toString(), []);

	const handleSetIsAdding = useCallback(
		async (adding: boolean) => {
			if (saveLock.current) return;
			setSaveError("");
			if (isSelecting && !adding && selectedTechnicians.length > 0) {
				saveLock.current = true;
				setSaving(true);
				try {
					await saveShift({
						technicians: selectedTechnicians.map((u) => u._id),
						shiftDate: startOfDay.getTime(),
					});
				} catch (error) {
					setSaveError(getErrorMessage(error, "Failed to save shift"));
					return;
				} finally {
					saveLock.current = false;
					setSaving(false);
				}
			}
			setSelection(
				adding
					? { shiftDate, ids: selectedTechnicians.map((tech) => tech._id) }
					: null,
			);
		},
		[isSelecting, selectedTechnicians, saveShift, startOfDay, shiftDate],
	);

	const loading = technicians === undefined || onShiftTechs === undefined;
	return (
		<WorkspaceScreen
			title="Earnings"
			description="Your team’s daily earnings and tips."
			dateControl
			mobileAction={
				isAuthUser
					? {
							label: isSelecting ? "Save shift" : "Edit shift",
							icon: isSelecting ? "check" : "account-edit-outline",
							onPress: () => {
								void handleSetIsAdding(!isSelecting);
							},
							disabled: loading || saving,
							loading: saving,
							direct: isSelecting,
						}
					: undefined
			}
			actions={
				isAuthUser ? (
					<AddButton
						desktopOnly
						isAdding={isSelecting}
						setIsAdding={handleSetIsAdding}
						label={isSelecting ? "Save shift" : "Edit shift"}
						disabled={loading || saving}
						loading={saving}
					/>
				) : null
			}
		>
			{saveError ? (
				<Text
					accessibilityRole="alert"
					style={{ color: colors.error, paddingBottom: 16 }}
				>
					{saveError}
				</Text>
			) : null}
			{isSelecting ? (
				<Text style={{ color: colors.onSurfaceVariant, paddingBottom: 12 }}>
					Select the technicians working this shift, then save.
				</Text>
			) : null}
			<Animated.FlatList
				contentContainerStyle={workspaceStyles.list}
				ListFooterComponent={WorkspaceListFooter}
				keyExtractor={keyExtractor}
				data={data}
				renderItem={renderItem}
				ListEmptyComponent={
					<ListEmptyComponent item="technician" loading={loading} />
				}
			/>
		</WorkspaceScreen>
	);
}
