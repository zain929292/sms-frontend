import StudentEnrollmentModal from "../../utils/modals/students/StudentEnrollmentModal";
import StudentPromotionModal from "../../utils/modals/students/StudentPromotionModal";

import useStudentEnrollments from "../../hook/StudentEnrollment/useStudentEnrollments";

import EnrollmentSummaryCards from "../../components/StudentEnrollment/EnrollmentSummaryCards";
import EnrollmentHeader from "../../components/StudentEnrollment/EnrollmentHeader";
import EnrollmentClassTabs from "../../components/StudentEnrollment/EnrollmentClassTabs";
import EnrollmentTableSection from "../../components/StudentEnrollment/EnrollmentTableSection";

const ENROLLMENT_LIMIT_OPTIONS = [10, 25, 50, 100];

export default function StudentEnrollments() {
  const e = useStudentEnrollments();

  return (
    <div className="space-y-5">
      {/* Backend Stats */}
      <EnrollmentSummaryCards stats={e.stats} />

      {/* Page Action */}
      <EnrollmentHeader onEnrollClick={e.openCreateModal} />

      {/* Class Tabs */}

<EnrollmentClassTabs
  classes={e.classes}
  selectedClassTab={e.selectedClassTab}
  activeCount={e.stats.active}
  classTabCounts={e.classTabCounts}
  onClassTabChange={e.handleClassTabChange}
/>


      {/* Search, Backend Pagination and Table */}
      <EnrollmentTableSection
        enrollment={e}
        limitOptions={ENROLLMENT_LIMIT_OPTIONS}
      />

      {/* Create / Edit Enrollment */}
      <StudentEnrollmentModal
        isOpen={e.isModalOpen}
        onClose={e.closeModal}
        enrollmentData={e.selectedEnrollment}
        onSubmit={e.handleSaveEnrollment}
        saving={e.saving}
      />

      {/* Student Promotion */}
      <StudentPromotionModal
        isOpen={e.isPromotionModalOpen}
        onClose={e.closePromotionModal}
        enrollment={e.promotionEnrollment}
        onSubmit={e.handlePromoteStudent}
        saving={e.promoting}
      />
    </div>
  );
}