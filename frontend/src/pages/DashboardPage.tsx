import { useEffect, useState } from "react";

import { getDashboard } from "../api/dashboard";
import { ApiError } from "../api/client";
import { listDepartments } from "../api/departments";
import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../features/auth/useAuth";
import type { Department } from "../types/department";
import type { Dashboard, GalleryPhoto } from "../types/dashboard";

const statisticLabels = [
  { key: "total_students", label: "Total Students" },
  { key: "total_faculty", label: "Faculty Members" },
  { key: "total_active_departments", label: "Courses" },
  { key: "upcoming_events", label: "Upcoming Events" },
] as const;

const courseGroups = [
  { category: "VOCATIONAL", title: "Vocational Courses" },
  { category: "REGULAR", title: "Regular Courses" },
] as const;

export function DashboardPage() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    if (token === null) return;
    const accessToken = token;
    let active = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);
      try {
        const [dashboardData, courseData] = await Promise.all([
          getDashboard(accessToken),
          listDepartments(accessToken),
        ]);
        if (active) {
          setDashboard(dashboardData);
          setDepartments(courseData.items.filter((course) => course.active));
        }
      } catch (caughtError) {
        if (active) setError(toMessage(caughtError));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadDashboard();
    return () => { active = false; };
  }, [token]);

  return (
    <main className="dashboard-page">
      <header className="college-hero">
        <div className="college-crest" aria-hidden="true">SW</div>
        <div>
          <p className="eyebrow hero-eyebrow">Welcome to the college community</p>
          <h1>Science Wing Junior College <span>Karimnagar</span></h1>
          <p className="college-affiliation">Affiliated to Board of Intermediate Education, Hyderabad</p>
        </div>
        <div className="hero-pattern" aria-hidden="true" />
      </header>

      {isLoading ? <LoadingState label="Loading college dashboard..." /> : null}
      {error ? <p className="form-error dashboard-error" role="alert">{error}</p> : null}
      {!isLoading && !error && dashboard ? <DashboardContent dashboard={dashboard} departments={departments} onSelectPhoto={setSelectedPhoto} /> : null}
      {selectedPhoto ? <GalleryDialog photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} /> : null}
    </main>
  );
}

function DashboardContent({ dashboard, departments, onSelectPhoto }: { dashboard: Dashboard; departments: Department[]; onSelectPhoto: (photo: GalleryPhoto) => void }) {
  return <>
    <section className="statistics-grid" aria-label="College statistics">
      {statisticLabels.map(({ key, label }) => <article className="statistic-card" key={key}><p>{label}</p><strong>{dashboard.statistics[key]}</strong></article>)}
    </section>
    <section className="dashboard-section" aria-labelledby="achievements-heading">
      <SectionHeading eyebrow="Celebrating success" id="achievements-heading" title="Student Achievements" />
      {dashboard.featured_achievements.length === 0 ? <EmptyState message="Featured student achievements will appear here." /> : <div className="achievement-grid">
        {dashboard.featured_achievements.map((achievement) => <article className="achievement-card" key={achievement.id}>
          {achievement.image_url ? <img src={achievement.image_url} alt="" /> : <div className="achievement-image-placeholder" aria-hidden="true">Award</div>}
          <div className="achievement-content"><p className="achievement-student">{achievement.student_display_name}</p><h3>{achievement.title}</h3><p>{achievement.description}</p><time dateTime={achievement.achievement_date}>{formatDate(achievement.achievement_date)}</time></div>
        </article>)}
      </div>}
    </section>
    <div className="dashboard-two-column">
      <section className="dashboard-section" aria-labelledby="events-heading">
        <SectionHeading eyebrow="Mark your calendar" id="events-heading" title="Upcoming Events" />
        {dashboard.upcoming_events.length === 0 ? <EmptyState message="There are no upcoming events right now." /> : <div className="event-list">
          {[...dashboard.upcoming_events].sort((a, b) => a.event_date.localeCompare(b.event_date)).map((event) => <article className="event-item" key={event.id}>
            <time className="event-date" dateTime={event.event_date}><span>{formatMonth(event.event_date)}</span><strong>{formatDay(event.event_date)}</strong></time>
            <div><h3>{event.title}</h3><p className="event-meta">{formatDateTime(event.event_date)} - {event.location}</p><p>{event.description}</p></div>
          </article>)}
        </div>}
      </section>
      <section className="dashboard-section notice-board" aria-labelledby="notifications-heading">
        <SectionHeading eyebrow="Notice board" id="notifications-heading" title="Notifications" />
        {dashboard.notifications.length === 0 ? <EmptyState message="There are no active notifications." /> : <div className="notice-list">
          {dashboard.notifications.map((notice) => <article className="notice-item" key={notice.id}>
            <div className="notice-title"><h3>{notice.title}</h3><span className={`priority-badge priority-${notice.priority.toLowerCase()}`}>{notice.priority.toLowerCase()} priority</span></div>
            <time dateTime={notice.published_at}>Published {formatDate(notice.published_at)}</time><p>{notice.message}</p>
          </article>)}
        </div>}
      </section>
    </div>
    <section className="dashboard-section" aria-labelledby="gallery-heading">
      <SectionHeading eyebrow="Campus life" id="gallery-heading" title="Cultural Events Gallery" />
      {dashboard.gallery.length === 0 ? <EmptyState message="Cultural event photographs will appear here." /> : <div className="gallery-grid">
        {dashboard.gallery.map((photo) => <button className="gallery-thumbnail" key={photo.id} type="button" onClick={() => onSelectPhoto(photo)} aria-label={`View larger image: ${photo.caption}`}><img src={photo.image_url} alt={photo.caption} /><span>{photo.caption}</span></button>)}
      </div>}
    </section>
    <section className="dashboard-section course-overview" aria-labelledby="courses-heading">
      <SectionHeading eyebrow="Academic pathways" id="courses-heading" title="Course Overview" />
      <div className="course-overview-grid">{courseGroups.map(({ category, title }) => {
        const courses = departments.filter((course) => course.category === category);
        return <article className="course-group" key={category}><h3>{title}</h3>{courses.length === 0 ? <p className="muted">No active courses are available.</p> : <ul>{courses.map((course) => <li key={course.id}><strong>{course.code}</strong><span>{course.name}</span></li>)}</ul>}</article>;
      })}</div>
    </section>
  </>;
}

function SectionHeading({ eyebrow, id, title }: { eyebrow: string; id: string; title: string }) { return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2 id={id}>{title}</h2></div></div>; }
function GalleryDialog({ photo, onClose }: { photo: GalleryPhoto; onClose: () => void }) {
  useEffect(() => { function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape") onClose(); } window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, [onClose]);
  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}><section className="gallery-dialog" role="dialog" aria-modal="true" aria-labelledby="gallery-dialog-caption" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" onClick={onClose} aria-label="Close image viewer" autoFocus>Close</button><img src={photo.image_url} alt={photo.caption} /><p id="gallery-dialog-caption">{photo.caption}</p></section></div>;
}
function EmptyState({ message }: { message: string }) { return <p className="empty-state">{message}</p>; }
function formatDate(value: string): string { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }
function formatDateTime(value: string): string { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(value)); }
function formatMonth(value: string): string { return new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(value)); }
function formatDay(value: string): string { return new Intl.DateTimeFormat("en-IN", { day: "2-digit" }).format(new Date(value)); }
function toMessage(error: unknown): string { return error instanceof ApiError ? error.message : "Unable to load the college dashboard. Please try again."; }
