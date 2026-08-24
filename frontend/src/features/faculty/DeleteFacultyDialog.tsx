import type { Faculty } from "../../types/faculty";

type DeleteFacultyDialogProps = {
  facultyMember: Faculty | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteFacultyDialog({ facultyMember, isDeleting, onCancel, onConfirm }: DeleteFacultyDialogProps) {
  if (facultyMember === null) return null;
  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-faculty-title">
        <h2 id="delete-faculty-title">Delete faculty member?</h2>
        <p>This will permanently remove {facultyMember.first_name} {facultyMember.last_name} ({facultyMember.employee_number}).</p>
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={onCancel} disabled={isDeleting}>Cancel</button>
          <button type="button" className="danger-button" onClick={onConfirm} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete faculty member"}</button>
        </div>
      </section>
    </div>
  );
}
