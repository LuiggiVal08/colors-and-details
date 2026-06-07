import * as Haptics from 'expo-haptics';

const safeHaptic = (execute: () => Promise<void>) => {
  void execute().catch(() => undefined);
};

export const impactLight = () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
export const selection = () => safeHaptic(() => Haptics.selectionAsync());

export const notificationHapatics = {
  success: () => safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
