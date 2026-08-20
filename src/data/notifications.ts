export interface AppNotification {
  id: string;
  restaurantId?: string;
  reviewId?: string;
  actorName: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  try {
    const response = await fetch("/api/notifications");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    await fetch("/api/notifications/read-all", { method: "POST" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
}
