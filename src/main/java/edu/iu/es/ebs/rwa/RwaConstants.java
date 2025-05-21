package edu.iu.es.ebs.rwa;

public class RwaConstants {

    public static final String WORK_ARRANGEMENT_DOC_TYPE = "RWA.WorkArrangement";
    public static final String MAIL = "mail";
    public static final String DISPLAY_NAME = "displayName";
    public static final String SAM_ACCOUNT_NAME = "sAMAccountName";
    public static final String TITLE = "title";
    public static final String PRD_ENVIRONMENT_CODE = "prd";
    public static final String DEV_ENVIRONMENT_CODE = "dev";
    public static final String UNT_ENVIRONMENT_CODE = "unt";
    public static final String STG_ENVIRONMENT_CODE = "stg";
    public static final String REVIEW_NOTIFICATION_TEXT = "RWA HR Approver or Supervisor: You are receiving this reminder because the Remote Work Arrangement noted above is due for its annual review as required per the Remote Work Policy. If after review of this arrangement, changes or updates need to be made, please have %s update the agreement using the Remote Work Arrangement system. If upon review, changes are not needed, no further action is necessary. If %s no longer works in your unit, please disregard this notice.";

    public static final String EXPIRING_NOTIFICATION_TEXT = "You are receiving this reminder because the Remote Work Arrangement for %s, %s, will expire in approximately 30 days.";

    public static class WorkflowActionTypes {
        public static final String ACKNOWLEDGE = "acknowledge";
        public static final String APPROVE = "approve";
        public static final String COMPLETE = "complete";
        public static final String CANCEL = "cancel";
        public static final String DISAPPROVE = "disapprove";
        public static final String FYI = "fyi";
        public static final String ROUTE = "route";
    }

    public static class Roles {
        public static final String ADMIN = "RWA_ADMIN";
        public static final String RWA_REVIEWER = "RWA_REVIEWER";
        public static final String BACKDOOR_USER = "BACKDOOR_USER";
        public static final String IMPERSONATOR = "IMPERSONATOR";
        public static final String PREVIOUS_ADMINISTRATOR = "PREVIOUS_ADMINISTRATOR";
        public static final String FIREFORM_GET_ARRANGEMENTS = "FIREFORM_GET_ARRANGEMENTS";
    }

    public static class RemoteWorkType {
        public static final String HYBRID = "HYBRID";
        public static final String FULLY_REMOTE = "FULLY_REMOTE";
    }

    public static class WorkDaysType {
        public static final String FIXED = "FIXED";
        public static final String FLOATING = "FLOATING";
    }

    public static String[] JOB_PAYGROUPS = {"BW1","BWP","HRA","HRO","HRP","HRR","HRW","HRX","S10","S12","SMO"};

    public static final String AFT_USER = "rwaaft";

    public static final class NotificationType {
        public static final String APPROVED = "rwa-arrangement-approved";
        public static final String REVIEW_REQUIRED = "rwa-review-required";
        public static final String EXPIRING_SOON = "rwa-expiring-soon";
    }

    public static final class NotificationTitle {
        public static final String APPROVED = "Remote Work Arrangement Approved";
        public static final String REVIEW_REQUIRED = "Remote Work Arrangement Review Required";
        public static final String EXPIRING_SOON = "Remote Work Arrangement Expiring Soon";
    }

    public static final String IMS_JOB_FULL_TIME_INDICATOR = "F";

    public static final class ArrangementSearchFields {
        public static final String CHART = "chartCode";
        public static final String ORG = "orgCode";
        public static final String RC = "rcCode";
        public static final String EMPLID = "employeeId";
        public static final String REMOTEWORKTYPE = "remoteWorkType";
        public static final String SUPERVISORID = "supervisorId";
        public static final String CURRENTSUPERVISORID = "currentSupervisorId";

    }
}
