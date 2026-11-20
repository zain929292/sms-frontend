
import {
  FileText,
  CheckCircle,
  XCircle,
  Award,
  BookOpen,
  Users,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react";

import StatCard from "../../utils/cards/Stat.card.util";

const ExamResultsStats = ({
  stats = {},
  activeTab = "overall",
}) => {
  const isOverall = activeTab === "overall";

  const total = Number(stats.total ?? 0);
  const passed = Number(stats.passed ?? 0);
  const failed = Number(stats.failed ?? 0);
  const averageMarks = Number(stats.average_marks ?? 0);

  const passedRate = total
    ? Math.round((passed / total) * 100)
    : 0;

  const failedRate = total
    ? Math.round((failed / total) * 100)
    : 0;

  const cards = isOverall
    ? [
        {
          key: "total",
          title: "Total Results",
          value: total,
          icon: FileText,
          color: "teal",
          subtitle: "All exam results",
        },
        {
          key: "passed",
          title: "Passed Students",
          value: passed,
          icon: CheckCircle,
          color: "emerald",
          subtitle: `${passedRate}% of total`,
          progressPct: passedRate,
          progressColor: "bg-emerald-500",
        },
        {
          key: "failed",
          title: "Failed Students",
          value: failed,
          icon: XCircle,
          color: "rose",
          subtitle: `${failedRate}% of total`,
          progressPct: failedRate,
          progressColor: "bg-rose-500",
        },
        {
          key: "average",
          title: "Average Marks",
          value: averageMarks,
          icon: Award,
          color: "amber",
          subtitle: "Average obtained marks",
        },
      ]
    : [
        {
          key: "students",
          title: "Total Students",
          value: Number(stats.total_students ?? 0),
          icon: Users,
          color: "teal",
          subtitle: "Students in selected class",
        },
        {
          key: "subjects",
          title: "Total Subjects",
          value: Number(stats.total_subjects ?? 0),
          icon: BookOpen,
          color: "emerald",
          subtitle: "Scheduled exam subjects",
        },
        {
          key: "entered",
          title: "Marks Entered",
          value: Number(stats.marks_entered ?? 0),
          icon: ClipboardCheck,
          color: "amber",
          subtitle: "Subject marks saved",
        },
        {
          key: "pending",
          title: "Pending Marks",
          value: Number(stats.pending_marks ?? 0),
          icon: TrendingUp,
          color: "rose",
          subtitle: "Subject marks remaining",
        },
      ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.key} {...card} />
      ))}
    </div>
  );
};

export default ExamResultsStats;
