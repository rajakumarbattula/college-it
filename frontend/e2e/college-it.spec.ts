import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const publicPassword = process.env.E2E_PUBLIC_PASSWORD;
const credentialsConfigured = Boolean(adminEmail && adminPassword && publicPassword);
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const publicEmail = `e2e.public.${runId}@example.invalid`;

test.describe.configure({ mode: "serial" });
test.skip(!credentialsConfigured, "Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, and E2E_PUBLIC_PASSWORD to run UI E2E tests.");

test("public registration, dashboard, authorization, and logout", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await page.getByRole("link", { name: "Register" }).click();

  await expect(page.getByRole("heading", { name: "Create an online account" })).toBeVisible();
  await expect(page.getByRole("combobox")).toHaveCount(0);
  await expect(page.getByText("ADMIN", { exact: true })).toHaveCount(0);
  await expect(page.getByText("STAFF", { exact: true })).toHaveCount(0);
  await expect(page.getByText("FACULTY", { exact: true })).toHaveCount(0);
  await page.getByLabel("Full name").fill("E2E Public Account");
  await page.getByLabel("Email").fill(publicEmail);
  await page.getByLabel("Password").fill(publicPassword!);
  await page.getByLabel("Confirm password").fill(publicPassword!);
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByRole("status")).toHaveText("Registration successful. Please sign in.");

  await page.getByLabel("Email").fill(publicEmail);
  await page.getByLabel("Password").fill(publicPassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await expect(page.getByText("Total Students")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Student Achievements" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Upcoming Events" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cultural Events Gallery" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Vocational Courses" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Regular Courses" })).toBeVisible();
  await expect(page.getByText("CS", { exact: true })).toBeVisible();
  await expect(page.getByText("EE", { exact: true })).toBeVisible();
  await expect(page.getByText("M.P.C", { exact: true })).toBeVisible();
  await expect(page.getByText("Bi.P.C", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Dashboard content" })).toHaveCount(0);

  await page.goto("/admin/content");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("administrator manages dashboard content and academic test students", async ({ page }) => {
  const achievementTitle = `E2E Achievement ${runId}`;
  const eventTitle = `E2E Event ${runId}`;
  const notificationTitle = `E2E Notification ${runId}`;
  const galleryCaption = `E2E Gallery ${runId}`;
  const csStudentId = `E2E-CS-${runId}`;
  const mpcStudentId = `E2E-MPC-${runId}`;

  await loginAsAdmin(page);
  try {
    await page.getByRole("link", { name: "Dashboard content" }).click();
    await createAchievement(page, achievementTitle);
    await createEvent(page, eventTitle);
    await createNotification(page, notificationTitle);
    await createGalleryPhoto(page, galleryCaption, eventTitle);

    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page.getByText(achievementTitle)).toBeVisible();
    await expect(page.getByText(eventTitle)).toBeVisible();
    await expect(page.getByText(notificationTitle)).toBeVisible();
    await expect(page.getByRole("img", { name: galleryCaption })).toBeVisible();

    await page.getByRole("link", { name: "Dashboard content" }).click();
    await editContentTitle(page, "Student Achievements", achievementTitle, `${achievementTitle} updated`);
    await editContentTitle(page, "Events", eventTitle, `${eventTitle} updated`);
    await editContentTitle(page, "Notifications", notificationTitle, `${notificationTitle} updated`);
    await editContentTitle(page, "Gallery Photos", galleryCaption, `${galleryCaption} updated`);

    await page.getByRole("link", { name: "Students" }).click();
    await createStudent(page, csStudentId, "E2E", "Course CS", "CS — Computer Science");
    await createStudent(page, mpcStudentId, "E2E", "Course MPC", "MPC — M.P.C");
    await editStudentDepartment(page, csStudentId, "MPC — M.P.C");
    await searchStudent(page, csStudentId);
    await expect(page.getByText(csStudentId, { exact: true })).toBeVisible();
  } finally {
    await cleanupStudent(page, csStudentId);
    await cleanupStudent(page, mpcStudentId);
    await page.goto("/admin/content");
    await cleanupContent(page, "Student Achievements", `${achievementTitle} updated`);
    await cleanupContent(page, "Events", `${eventTitle} updated`);
    await cleanupContent(page, "Notifications", `${notificationTitle} updated`);
    await cleanupContent(page, "Gallery Photos", `${galleryCaption} updated`);
  }
});

test("unauthenticated users are denied protected routes", async ({ page }) => {
  await page.goto("/students");
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/admin/content");
  await expect(page).toHaveURL(/\/login$/);
});

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(adminEmail!);
  await page.getByLabel("Password").fill(adminPassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("link", { name: "Dashboard content" })).toBeVisible();
}

async function createAchievement(page: Page, title: string) {
  await openModuleForm(page, "Student Achievements");
  await page.getByLabel("Student display name").fill("E2E Achievement Student");
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Description").fill("Fictional achievement created by Playwright.");
  await page.getByLabel("Achievement date").fill("2026-09-01");
  await page.getByLabel("Feature on dashboard").check();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
}

async function createEvent(page: Page, title: string) {
  await openModuleForm(page, "Events");
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Description").fill("Fictional upcoming event created by Playwright.");
  await page.getByLabel("Event date and time").fill("2027-10-01T10:30");
  await page.getByLabel("Location").fill("E2E Hall");
  await page.getByLabel("Feature on dashboard").check();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
}

async function createNotification(page: Page, title: string) {
  await openModuleForm(page, "Notifications");
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Message").fill("Fictional notice created by Playwright.");
  await page.getByLabel("Publication date and time").fill("2026-09-01T09:00");
  await page.getByLabel("Expiry date and time").fill("2027-12-01T09:00");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
}

async function createGalleryPhoto(page: Page, caption: string, eventTitle: string) {
  await openModuleForm(page, "Gallery Photos");
  await page.getByLabel("Caption").fill(caption);
  await page.getByLabel("Image URL or local path").fill("/demo-assets/cultural-day.svg");
  await page.getByLabel("Associated event (optional)").selectOption({ label: eventTitle });
  await page.getByLabel("Display order").fill("99");
  await page.getByLabel("Feature on dashboard").check();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(caption, { exact: true })).toBeVisible();
}

async function openModuleForm(page: Page, module: string) {
  await page.getByRole("tab", { name: module }).click();
  await page.getByRole("button", { name: "Add item" }).click();
}

async function editContentTitle(page: Page, module: string, title: string, updatedTitle: string) {
  await page.getByRole("tab", { name: module }).click();
  const row = page.getByRole("row", { name: new RegExp(title) });
  await row.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel(module === "Gallery Photos" ? "Caption" : "Title").fill(updatedTitle);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(updatedTitle, { exact: true })).toBeVisible();
}

async function createStudent(page: Page, studentId: string, firstName: string, lastName: string, course: string) {
  await page.getByRole("link", { name: "Add student" }).click();
  await page.getByLabel("Student ID").fill(studentId);
  await page.getByLabel("First name").fill(firstName);
  await page.getByLabel("Last name").fill(lastName);
  await page.getByLabel("College email").fill(`${studentId.toLowerCase()}@example.invalid`);
  await page.getByLabel("Department").selectOption({ label: course });
  await page.getByRole("button", { name: "Save student" }).click();
  await expect(page).toHaveURL(/\/students$/);
}

async function editStudentDepartment(page: Page, studentId: string, course: string) {
  await searchStudent(page, studentId);
  const row = page.getByRole("row", { name: new RegExp(studentId) });
  await row.getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("Department").selectOption({ label: course });
  await page.getByRole("button", { name: "Save student" }).click();
}

async function searchStudent(page: Page, studentId: string) {
  await page.getByRole("combobox", { name: "Search field" }).selectOption("student_number");
  await page.getByRole("textbox", { name: "Search students" }).fill(studentId);
  await page.getByRole("button", { name: "Search" }).click();
}

async function cleanupStudent(page: Page, studentId: string) {
  await page.goto("/students");
  await searchStudent(page, studentId);
  const row = page.getByRole("row", { name: new RegExp(studentId) });
  if (await row.count()) {
    await row.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  }
}

async function cleanupContent(page: Page, module: string, title: string) {
  await page.getByRole("tab", { name: module }).click();
  const row = page.getByRole("row", { name: new RegExp(title) });
  if (await row.count()) {
    await row.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  }
}
