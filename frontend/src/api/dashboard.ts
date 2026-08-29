import { apiRequest } from "./client";
import type { Achievement, CollegeEvent, CollegeNotification, Dashboard, GalleryPhoto } from "../types/dashboard";

export function getDashboard(token: string): Promise<Dashboard> {
  return apiRequest<Dashboard>("/dashboard", { token });
}

export type AchievementInput = Omit<Achievement, "id" | "created_at">;
export type EventInput = Omit<CollegeEvent, "id" | "created_at">;
export type NotificationInput = Omit<CollegeNotification, "id" | "created_at">;
export type GalleryInput = Omit<GalleryPhoto, "id" | "created_at">;

export function listAchievements(token: string): Promise<Achievement[]> { return apiRequest<Achievement[]>("/dashboard/achievements", { token }); }
export function saveAchievement(token: string, values: AchievementInput, id?: string): Promise<Achievement> { return apiRequest<Achievement>(`/dashboard/achievements${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", token, body: values }); }
export function deleteAchievement(token: string, id: string): Promise<void> { return apiRequest<void>(`/dashboard/achievements/${id}`, { method: "DELETE", token }); }

export function listEvents(token: string): Promise<CollegeEvent[]> { return apiRequest<CollegeEvent[]>("/dashboard/events", { token }); }
export function saveEvent(token: string, values: EventInput, id?: string): Promise<CollegeEvent> { return apiRequest<CollegeEvent>(`/dashboard/events${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", token, body: values }); }
export function deleteEvent(token: string, id: string): Promise<void> { return apiRequest<void>(`/dashboard/events/${id}`, { method: "DELETE", token }); }

export function listNotifications(token: string): Promise<CollegeNotification[]> { return apiRequest<CollegeNotification[]>("/dashboard/notifications", { token }); }
export function saveNotification(token: string, values: NotificationInput, id?: string): Promise<CollegeNotification> { return apiRequest<CollegeNotification>(`/dashboard/notifications${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", token, body: values }); }
export function deleteNotification(token: string, id: string): Promise<void> { return apiRequest<void>(`/dashboard/notifications/${id}`, { method: "DELETE", token }); }

export function listGallery(token: string): Promise<GalleryPhoto[]> { return apiRequest<GalleryPhoto[]>("/dashboard/gallery", { token }); }
export function saveGalleryPhoto(token: string, values: GalleryInput, id?: string): Promise<GalleryPhoto> { return apiRequest<GalleryPhoto>(`/dashboard/gallery${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", token, body: values }); }
export function deleteGalleryPhoto(token: string, id: string): Promise<void> { return apiRequest<void>(`/dashboard/gallery/${id}`, { method: "DELETE", token }); }
