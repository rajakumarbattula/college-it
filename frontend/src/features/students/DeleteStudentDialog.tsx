import type { Student } from "../../types/student";

type DeleteStudentDialogProps = {
  student: Student | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteStudentDialog({
  student,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteStudentDialogProps) {
  if (student === null) {
    return null;
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
        <h2 id="delete-title">Delete student?</h2>
        <p>
          This will permanently remove {student.first_name} {student.last_name} ({student.student_number}).
        </p>
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>
          <button type="button" className="danger-button" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete student"}
          </button>
        </div>
      </section>
    </div>
  );
}
