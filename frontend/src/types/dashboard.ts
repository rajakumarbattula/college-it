export type DashboardStatistics = {
  total_students: number;
  total_faculty: number;
  total_active_departments: number;
  upcoming_events: number;
};

export type Achievement = {
  id: string;
  student_id: string | null;
  student_display_name: string;
  title: string;
  description: string;
  category: string;
  achievement_date: string;
  image_url: string | null;
  featured: boolean;
  created_at: string;
};

export type CollegeEvent = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  event_type: string;
  image_url: string | null;
  featured: boolean;
  created_at: string;
};

export type CollegeNotification = {
  id: string;
  title: string;
  message: string;
  published_at: string;
  expires_at: string | null;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  active: boolean;
  created_at: string;
};

export type GalleryPhoto = {
  id: string;
  event_id: string | null;
  caption: string;
  image_url: string;
  display_order: number;
  featured: boolean;
  created_at: string;
};

export type Dashboard = {
  statistics: DashboardStatistics;
  featured_achievements: Achievement[];
  upcoming_events: CollegeEvent[];
  notifications: CollegeNotification[];
  gallery: GalleryPhoto[];
};
