import { useQueries } from "@tanstack/react-query";
import { queryKeys } from "./endpoints";
import { lmsApi } from "./lmsApi";

const pageParams = { page: 1, pageSize: 100 };

export function useAdminStudentDetails(studentId: string) {
  const enabled = Boolean(studentId);
  const [overview, courses, assessments, submissions, liveClasses, certificates, activity] = useQueries({
    queries: [
      { queryKey: queryKeys.admin.student(studentId), queryFn: () => lmsApi.admin.student(studentId), enabled },
      { queryKey: queryKeys.admin.studentCourses(studentId), queryFn: () => lmsApi.admin.studentCourses(studentId, pageParams), enabled },
      { queryKey: queryKeys.admin.studentAssessments(studentId), queryFn: () => lmsApi.admin.studentAssessments(studentId, pageParams), enabled },
      { queryKey: queryKeys.admin.studentSubmissions(studentId), queryFn: () => lmsApi.admin.studentSubmissions(studentId, pageParams), enabled },
      { queryKey: queryKeys.admin.studentLiveClasses(studentId), queryFn: () => lmsApi.admin.studentLiveClasses(studentId, pageParams), enabled },
      { queryKey: queryKeys.admin.studentCertificates(studentId), queryFn: () => lmsApi.admin.studentCertificates(studentId, pageParams), enabled },
      { queryKey: queryKeys.admin.studentActivity(studentId), queryFn: () => lmsApi.admin.studentActivity(studentId, pageParams), enabled },
    ].map((query) => ({ ...query, staleTime: 60_000, retry: 1, refetchOnWindowFocus: false })),
  });

  return { overview, courses, assessments, submissions, liveClasses, certificates, activity };
}
