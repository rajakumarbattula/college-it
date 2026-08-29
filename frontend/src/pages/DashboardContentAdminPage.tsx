import { type FormEvent, useCallback, useEffect, useState } from "react";

import {
  deleteAchievement,
  deleteEvent,
  deleteGalleryPhoto,
  deleteNotification,
  listAchievements,
  listEvents,
  listGallery,
  listNotifications,
  saveAchievement,
  saveEvent,
  saveGalleryPhoto,
  saveNotification,
  type AchievementInput,
  type EventInput,
  type GalleryInput,
  type NotificationInput,
} from "../api/dashboard";
import { ApiError } from "../api/client";
import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../features/auth/useAuth";
import type { Achievement, CollegeEvent, CollegeNotification, GalleryPhoto } from "../types/dashboard";

type ContentKind = "achievements" | "events" | "notifications" | "gallery";
type ContentItem = Achievement | CollegeEvent | CollegeNotification | GalleryPhoto;
type Draft = Record<string, string | boolean | null>;

const modules: Array<{ id: ContentKind; label: string }> = [
  { id: "achievements", label: "Student Achievements" },
  { id: "events", label: "Events" },
  { id: "notifications", label: "Notifications" },
  { id: "gallery", label: "Gallery Photos" },
];

export function DashboardContentAdminPage() {
  const { token } = useAuth();
  const [activeModule, setActiveModule] = useState<ContentKind>("achievements");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [notifications, setNotifications] = useState<CollegeNotification[]>([]);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleting, setDeleting] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    if (token === null) return;
    setIsLoading(true);
    setError(null);
    try {
      const [achievementData, eventData, notificationData, galleryData] = await Promise.all([
        listAchievements(token), listEvents(token), listNotifications(token), listGallery(token),
      ]);
      setAchievements(achievementData);
      setEvents(eventData);
      setNotifications(notificationData);
      setGallery(galleryData);
    } catch (caughtError) {
      setError(toMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { void loadContent(); }, [loadContent]);

  const items = activeModule === "achievements" ? achievements : activeModule === "events" ? events : activeModule === "notifications" ? notifications : gallery;
  const formItem = isCreating ? null : editing;

  async function save(kind: ContentKind, draft: Draft) {
    if (token === null) return;
    const validationError = validateDraft(kind, draft);
    if (validationError) { setError(validationError); return; }
    setIsSaving(true);
    setError(null);
    try {
      if (kind === "achievements") await saveAchievement(token, achievementValues(draft), editing?.id);
      if (kind === "events") await saveEvent(token, eventValues(draft), editing?.id);
      if (kind === "notifications") await saveNotification(token, notificationValues(draft), editing?.id);
      if (kind === "gallery") await saveGalleryPhoto(token, galleryValues(draft), editing?.id);
      setEditing(null);
      setIsCreating(false);
      await loadContent();
    } catch (caughtError) {
      setError(toMessage(caughtError));
    } finally {
      setIsSaving(false);
    }
  }

  async function remove() {
    if (token === null || deleting === null) return;
    setIsSaving(true);
    setError(null);
    try {
      if (activeModule === "achievements") await deleteAchievement(token, deleting.id);
      if (activeModule === "events") await deleteEvent(token, deleting.id);
      if (activeModule === "notifications") await deleteNotification(token, deleting.id);
      if (activeModule === "gallery") await deleteGalleryPhoto(token, deleting.id);
      setDeleting(null);
      await loadContent();
    } catch (caughtError) {
      setError(toMessage(caughtError));
    } finally {
      setIsSaving(false);
    }
  }

  function selectModule(kind: ContentKind) {
    setActiveModule(kind);
    setEditing(null);
    setIsCreating(false);
    setError(null);
  }

  return <main className="page content-admin-page">
    <div className="page-header"><div><p className="eyebrow">Administration</p><h1>Dashboard Content</h1><p className="muted">Publish the achievements, events, notices, and gallery items shown on the college dashboard.</p></div></div>
    <div className="admin-tabs" role="tablist" aria-label="Dashboard content sections">
      {modules.map((module) => <button key={module.id} type="button" role="tab" aria-selected={activeModule === module.id} className={activeModule === module.id ? "active" : ""} onClick={() => selectModule(module.id)}>{module.label}</button>)}
    </div>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {isLoading ? <LoadingState label="Loading dashboard content..." /> : <>
      <div className="admin-toolbar"><h2>{modules.find((module) => module.id === activeModule)?.label}</h2><button type="button" onClick={() => { setEditing(null); setIsCreating(true); }}>Add item</button></div>
      {(isCreating || formItem) ? <ContentForm kind={activeModule} item={formItem} events={events} isSaving={isSaving} onCancel={() => { setEditing(null); setIsCreating(false); }} onSubmit={save} /> : <ContentList kind={activeModule} items={items} onEdit={setEditing} onDelete={setDeleting} />}
    </>}
    {deleting ? <DeleteContentDialog label={itemTitle(deleting)} isDeleting={isSaving} onCancel={() => setDeleting(null)} onConfirm={() => void remove()} /> : null}
  </main>;
}

function ContentList({ kind, items, onEdit, onDelete }: { kind: ContentKind; items: ContentItem[]; onEdit: (item: ContentItem) => void; onDelete: (item: ContentItem) => void }) {
  if (items.length === 0) return <p className="empty-state">No {modules.find((module) => module.id === kind)?.label.toLowerCase()} have been added.</p>;
  return <div className="table-wrapper"><table><thead><tr><th scope="col">Title</th><th scope="col">Details</th><th scope="col">Status</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr></thead><tbody>
    {items.map((item) => <tr key={item.id}><td>{itemTitle(item)}</td><td>{itemDetails(kind, item)}</td><td>{itemStatus(kind, item)}</td><td><div className="table-actions"><button className="text-button" type="button" onClick={() => onEdit(item)}>Edit</button><button className="text-button danger" type="button" onClick={() => onDelete(item)}>Delete</button></div></td></tr>)}
  </tbody></table></div>;
}

function ContentForm({ kind, item, events, isSaving, onCancel, onSubmit }: { kind: ContentKind; item: ContentItem | null; events: CollegeEvent[]; isSaving: boolean; onCancel: () => void; onSubmit: (kind: ContentKind, draft: Draft) => Promise<void> }) {
  const [draft, setDraft] = useState<Draft>(() => item ? toDraft(kind, item) : emptyDraft(kind));
  function update(field: string, value: string | boolean) { setDraft((current) => ({ ...current, [field]: value })); }
  return <form className="resource-form admin-form" onSubmit={(event: FormEvent) => { event.preventDefault(); void onSubmit(kind, draft); }} noValidate>
    <h3>{item ? "Edit item" : "Add item"}</h3>
    {kind === "achievements" ? <>
      <TextField label="Student display name" value={text(draft, "student_display_name")} onChange={(value) => update("student_display_name", value)} required />
      <TextField label="Title" value={text(draft, "title")} onChange={(value) => update("title", value)} required />
      <TextArea label="Description" value={text(draft, "description")} onChange={(value) => update("description", value)} required />
      <SelectField label="Category" value={text(draft, "category")} options={["ACADEMIC", "SPORTS", "CULTURAL", "OTHER"]} onChange={(value) => update("category", value)} />
      <TextField label="Achievement date" type="date" value={text(draft, "achievement_date")} onChange={(value) => update("achievement_date", value)} required />
      <TextField label="Image URL or local path" value={text(draft, "image_url")} onChange={(value) => update("image_url", value)} hint="Optional. Use an HTTPS URL or a local path such as /demo-assets/science-fair.svg." />
      <CheckField label="Feature on dashboard" checked={flag(draft, "featured")} onChange={(value) => update("featured", value)} />
    </> : null}
    {kind === "events" ? <>
      <TextField label="Title" value={text(draft, "title")} onChange={(value) => update("title", value)} required />
      <TextArea label="Description" value={text(draft, "description")} onChange={(value) => update("description", value)} required />
      <TextField label="Event date and time" type="datetime-local" value={text(draft, "event_date")} onChange={(value) => update("event_date", value)} required />
      <TextField label="Location" value={text(draft, "location")} onChange={(value) => update("location", value)} required />
      <SelectField label="Event type" value={text(draft, "event_type")} options={["ACADEMIC", "CULTURAL", "SPORTS", "OTHER"]} onChange={(value) => update("event_type", value)} />
      <TextField label="Image URL or local path" value={text(draft, "image_url")} onChange={(value) => update("image_url", value)} hint="Optional." />
      <CheckField label="Feature on dashboard" checked={flag(draft, "featured")} onChange={(value) => update("featured", value)} />
    </> : null}
    {kind === "notifications" ? <>
      <TextField label="Title" value={text(draft, "title")} onChange={(value) => update("title", value)} required />
      <TextArea label="Message" value={text(draft, "message")} onChange={(value) => update("message", value)} required />
      <TextField label="Publication date and time" type="datetime-local" value={text(draft, "published_at")} onChange={(value) => update("published_at", value)} required />
      <TextField label="Expiry date and time" type="datetime-local" value={text(draft, "expires_at")} onChange={(value) => update("expires_at", value)} hint="Optional." />
      <SelectField label="Priority" value={text(draft, "priority")} options={["LOW", "NORMAL", "HIGH", "URGENT"]} onChange={(value) => update("priority", value)} />
      <CheckField label="Active" checked={flag(draft, "active")} onChange={(value) => update("active", value)} />
    </> : null}
    {kind === "gallery" ? <>
      <TextField label="Caption" value={text(draft, "caption")} onChange={(value) => update("caption", value)} required />
      <TextField label="Image URL or local path" value={text(draft, "image_url")} onChange={(value) => update("image_url", value)} required hint="Use an HTTPS URL or local /demo-assets/... path." />
      <label className="form-field">Associated event (optional)<select value={text(draft, "event_id")} onChange={(event) => update("event_id", event.target.value)}><option value="">No associated event</option>{events.map((event) => <option value={event.id} key={event.id}>{event.title}</option>)}</select></label>
      <TextField label="Display order" type="number" value={text(draft, "display_order")} onChange={(value) => update("display_order", value)} required />
      <CheckField label="Feature on dashboard" checked={flag(draft, "featured")} onChange={(value) => update("featured", value)} />
    </> : null}
    <div className="dialog-actions"><button className="secondary-button" type="button" onClick={onCancel}>Cancel</button><button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button></div>
  </form>;
}

function TextField({ label, value, onChange, type = "text", required = false, hint }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; hint?: string }) { const id = label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"); return <label className="form-field" htmlFor={id}>{label}<input id={id} type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} />{hint ? <small className="muted">{hint}</small> : null}</label>; }
function TextArea({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required: boolean }) { const id = label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"); return <label className="form-field" htmlFor={id}>{label}<textarea id={id} value={value} required={required} onChange={(event) => onChange(event.target.value)} /></label>; }
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { const id = label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"); return <label className="form-field" htmlFor={id}>{label}<select id={id} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option value={option} key={option}>{option}</option>)}</select></label>; }
function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="check-field"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />{label}</label>; }
function DeleteContentDialog({ label, isDeleting, onCancel, onConfirm }: { label: string; isDeleting: boolean; onCancel: () => void; onConfirm: () => void }) { return <div className="dialog-backdrop" role="presentation"><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="delete-content-title"><h2 id="delete-content-title">Delete content item?</h2><p>Delete “{label}”? This cannot be undone.</p><div className="dialog-actions"><button className="secondary-button" type="button" onClick={onCancel} disabled={isDeleting}>Cancel</button><button className="danger-button" type="button" onClick={onConfirm} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete"}</button></div></section></div>; }

function itemTitle(item: ContentItem): string { return "caption" in item ? item.caption : item.title; }
function itemDetails(kind: ContentKind, item: ContentItem): string { if (kind === "achievements") return (item as Achievement).student_display_name; if (kind === "events") return new Date((item as CollegeEvent).event_date).toLocaleDateString("en-IN"); if (kind === "notifications") return (item as CollegeNotification).priority; return `Order ${(item as GalleryPhoto).display_order}`; }
function itemStatus(kind: ContentKind, item: ContentItem): string { if (kind === "notifications") return (item as CollegeNotification).active ? "Active" : "Inactive"; return (item as Achievement | CollegeEvent | GalleryPhoto).featured ? "Featured" : "Standard"; }
function emptyDraft(kind: ContentKind): Draft { if (kind === "achievements") return { student_display_name: "", title: "", description: "", category: "ACADEMIC", achievement_date: "", image_url: "", featured: false }; if (kind === "events") return { title: "", description: "", event_date: "", location: "", event_type: "ACADEMIC", image_url: "", featured: false }; if (kind === "notifications") return { title: "", message: "", published_at: "", expires_at: "", priority: "NORMAL", active: true }; return { caption: "", image_url: "", event_id: "", display_order: "0", featured: false }; }
function toDraft(kind: ContentKind, item: ContentItem): Draft { if (kind === "achievements") { const value = item as Achievement; return { ...value, image_url: value.image_url ?? "", achievement_date: value.achievement_date.slice(0, 10) }; } if (kind === "events") { const value = item as CollegeEvent; return { ...value, image_url: value.image_url ?? "", event_date: dateTimeInput(value.event_date) }; } if (kind === "notifications") { const value = item as CollegeNotification; return { ...value, published_at: dateTimeInput(value.published_at), expires_at: value.expires_at ? dateTimeInput(value.expires_at) : "" }; } const value = item as GalleryPhoto; return { ...value, event_id: value.event_id ?? "", display_order: String(value.display_order) }; }
function achievementValues(draft: Draft): AchievementInput { return { student_id: null, student_display_name: text(draft, "student_display_name"), title: text(draft, "title"), description: text(draft, "description"), category: text(draft, "category"), achievement_date: text(draft, "achievement_date"), image_url: text(draft, "image_url") || null, featured: flag(draft, "featured") }; }
function eventValues(draft: Draft): EventInput { return { title: text(draft, "title"), description: text(draft, "description"), event_date: new Date(text(draft, "event_date")).toISOString(), location: text(draft, "location"), event_type: text(draft, "event_type"), image_url: text(draft, "image_url") || null, featured: flag(draft, "featured") }; }
function notificationValues(draft: Draft): NotificationInput { return { title: text(draft, "title"), message: text(draft, "message"), published_at: new Date(text(draft, "published_at")).toISOString(), expires_at: text(draft, "expires_at") ? new Date(text(draft, "expires_at")).toISOString() : null, priority: text(draft, "priority") as NotificationInput["priority"], active: flag(draft, "active") }; }
function galleryValues(draft: Draft): GalleryInput { return { caption: text(draft, "caption"), image_url: text(draft, "image_url"), event_id: text(draft, "event_id") || null, display_order: Number(text(draft, "display_order")), featured: flag(draft, "featured") }; }
function validateDraft(kind: ContentKind, draft: Draft): string | null { const required = kind === "achievements" ? ["student_display_name", "title", "description", "achievement_date"] : kind === "events" ? ["title", "description", "event_date", "location"] : kind === "notifications" ? ["title", "message", "published_at"] : ["caption", "image_url", "display_order"]; if (required.some((field) => !text(draft, field).trim())) return "Complete all required fields."; const image = text(draft, "image_url"); if (image && !image.startsWith("/") && !/^https?:\/\//.test(image)) return "Image references must be HTTP(S) URLs or local absolute paths."; if (kind === "notifications" && text(draft, "expires_at") && new Date(text(draft, "expires_at")) < new Date(text(draft, "published_at"))) return "Expiry date must not be before publication date."; if (kind === "gallery" && (!Number.isInteger(Number(text(draft, "display_order"))) || Number(text(draft, "display_order")) < 0)) return "Display order must be zero or a positive whole number."; return null; }
function text(draft: Draft, field: string): string { const value = draft[field]; return typeof value === "string" ? value : ""; }
function flag(draft: Draft, field: string): boolean { return draft[field] === true; }
function dateTimeInput(value: string): string { return new Date(value).toISOString().slice(0, 16); }
function toMessage(error: unknown): string { return error instanceof ApiError ? error.message : "Unable to update dashboard content. Please try again."; }
