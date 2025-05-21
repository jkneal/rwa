package edu.iu.es.ebs.rwa.service.impl;

import edu.iu.es.ebs.rwa.RwaConstants;
import edu.iu.es.ebs.rwa.RwaUtils;
import edu.iu.es.ebs.rwa.RwaUtils.EmployeeJobKey;
import edu.iu.es.ebs.rwa.domain.*;
import edu.iu.es.ebs.rwa.repositories.ArrangementDocumentRepository;
import edu.iu.es.ebs.rwa.repositories.CompletedArrangmentRepository;
import edu.iu.es.ebs.rwa.repositories.CountryRepository;
import edu.iu.es.ebs.rwa.repositories.StateRepository;
import edu.iu.es.ebs.rwa.service.*;
import edu.iu.es.ep.launchpad.notifications.domain.Notification;
import edu.iu.es.ep.launchpad.notifications.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import static edu.iu.es.ebs.rwa.domain.WorkflowDocument.*;

@Service
@Transactional
@Slf4j
public class ArrangementServiceImpl implements ArrangementService {
    private final Log LOG = LogFactory.getLog(this.getClass());

    public static final String IMS_FAILED_TO_FIND_ACCOUNT = "Failed to find account for university id";
    public static final String IMS_UNABLE_TO_GET_PERSON = "Unable to get person information";

    public static final String HYBRID = "Hybrid";
    public static final String FULLY_REMOTE = "Fully remote";

    @Autowired
    private WorkflowService workflowService;

    @Autowired
    private PersonService personService;

    @Autowired
    private ArrangementDocumentRepository arrangementDocumentRepository;

    @Autowired
    private CompletedArrangmentRepository completedArrangmentRepository;

    @Autowired
    AttestationService attestationService;

    @Autowired
    EntityManager entityManager;

    @Autowired
    NotificationService notificationService;

    @Autowired
    CountryRepository countryRepository;

    @Autowired
    StateRepository stateRepository;

    @Autowired
    OrganizationService organizationService;

    @Value("${application.url}")
    private String rwaUrl;

    @Value("${feature.notification.enabled:true}")
    private Boolean sendNotification;

    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final int NUM_STREAMS = 25;

    @Override
    public ArrangementDocument createArrangement(Job job, String networkId) {
        ArrangementDocument doc = new ArrangementDocument();

        doc.setJob(job);

        Person employee = personService.getPersonByUniversityId(job.getEmplid());
        if(employee == null) {
            throw new RuntimeException("Unable to get person information for " + job.getEmplid());
        }
        doc.setEmployeeFirstName(employee.getFirstName());
        doc.setEmployeeLastName(employee.getLastName());

        doc.setCreateTimestamp(LocalDateTime.now());
        doc.setCreateUserId(networkId);
        doc.setWorkAddressHome(true);
        doc.setRemoteWorkStartDate(LocalDate.now());

        if (StringUtils.isNotBlank(job.getReportsToUniversityId())) {
            Person reportsToPerson = personService.getPersonByUniversityId(job.getReportsToUniversityId());
            if(employee == null) {
                throw new RuntimeException("Unable to get person information for " + job.getReportsToUniversityId());
            }
            doc.setSupervisorReviewerId(reportsToPerson.getNetworkId());
        }

        AttestationText currentAttestation = attestationService.getCurrentAttestation();
        if (currentAttestation == null) {
            throw new RuntimeException("No current attestation text configured");
        }
        doc.setAttestationText(currentAttestation);

        return doc;
    }

    @Override
    public ArrangementDocument getArrangement(String documentNumber) {
        ArrangementDocument doc = arrangementDocumentRepository.findById(documentNumber).orElse(null);
        if (doc == null) {
            throw new RuntimeException("Unable to find arrangement for document number " + documentNumber);
        }

        if (StringUtils.equals(STATUS_ENROUTE, doc.getStatus()) || StringUtils.equals(STATUS_ABORTED, doc.getStatus())) {
            doc.setWorkflowDocument(workflowService.getWorkflowDocument(doc.getDocumentNumber()));
        }

        return doc;
    }

    @Override
    public List<WorkflowAction> getActionsTaken(String documentNumber) {
        ArrangementDocument doc = arrangementDocumentRepository.findById(documentNumber).orElse(null);
        if (doc == null) {
            throw new RuntimeException("Unable to find arrangement for document number " + documentNumber);
        }

        List<WorkflowAction> workflowActions = workflowService.getWorkflowActions(documentNumber);

        for (ArrangementAdHoc adHoc: doc.getArrangementAdHocs()) {
            if (adHoc.isPushback()) {
                WorkflowAction action = new WorkflowAction();
                action.setPrincipalName(adHoc.getRequesterId());
                action.setType("HR adhoc to " + adHoc.getNetworkId());
                action.setAnnotation(adHoc.getComments());
                action.setCreated(adHoc.getCreateTimestamp());

                workflowActions.add(action);
            }
        }

        Collections.sort(workflowActions, (WorkflowAction a1, WorkflowAction a2) ->
            a1.getCreated().compareTo(a2.getCreated()));

        return workflowActions;
    }

    @Override
    public ArrangementDocument updateArrangement(String documentNumber, String networkId) {
        ArrangementDocument doc = arrangementDocumentRepository.findById(documentNumber).orElse(null);
        if (doc == null) {
            throw new RuntimeException("Unable to find arrangement for document number " + documentNumber);
        }

        entityManager.detach(doc);

        Person employee = personService.getPersonByUniversityId(doc.getJob().getEmplid());
        if(employee == null) {
            throw new RuntimeException("Unable to get person information for " + doc.getJob().getEmplid());
        }
        doc.setEmployeeFirstName(employee.getFirstName());
        doc.setEmployeeLastName(employee.getLastName());

        doc.setDocumentNumber(null);
        doc.setCreateTimestamp(LocalDateTime.now());
        doc.setCreateUserId(networkId);
        doc.setCompletedTimestamp(null);
        doc.setAttestationAcknowledged(false);
        doc.getArrangementWorkDays().setDocumentNumber(null);
        doc.setArrangementAdHocs(new ArrayList<>());
        doc.setHrReviewerId(null);
        // Ensure the studentFacingPercentage field is preserved when copying an arrangement
        // No need to set it explicitly as it's already copied from the original document

        for (Job job: employee.getJobs()) {
            if (job.equals(doc.getJob())) {
                doc.getJob().setJobDepartmentId(job.getJobDepartmentId());
                doc.getJob().setJobTitle(job.getJobTitle());
                if(StringUtils.isNotBlank(job.getReportsToUniversityId())) {
                    Person reportsToPerson = personService.getPersonByUniversityId(job.getReportsToUniversityId());
                    if (employee == null) {
                        throw new RuntimeException("Unable to get person information for " + job.getReportsToUniversityId());
                    }
                    doc.setSupervisorReviewerId(reportsToPerson.getNetworkId());
                }
            }
        }

        AttestationText currentAttestation = attestationService.getCurrentAttestation();
        if (currentAttestation == null) {
            throw new RuntimeException("No current attestation text configured");
        }
        doc.setAttestationText(currentAttestation);

        return doc;
    }

    @Override
    public ArrangementDocument route(ArrangementDocument document) {
        workflowService.createWorkflowDocument(document);

        document.setStatus(STATUS_ENROUTE);
        document.getArrangementWorkDays().setDocumentNumber(document.getDocumentNumber());
        document.setLastUpdateTimetamp(LocalDateTime.now());
        document = arrangementDocumentRepository.save(document);

        document.setWorkCountry(countryRepository.findById(document.getWorkAddressCountry()).orElse(null));
        if (StringUtils.isNotBlank(document.getWorkAddressState())) {
            document.setWorkState(stateRepository.findById(document.getWorkAddressState()).orElse(null));
        } else {
            document.setWorkState(null);
        }

        workflowService.route(document.getDocumentNumber());

        document.setWorkflowDocument(workflowService.getWorkflowDocument(document.getDocumentNumber()));

        return document;
    }

    @Override
    public ArrangementDocument approve(ArrangementDocument document, String networkId) {
        workflowService.updateWorkflowDocument(document);

        if (StringUtils.isNotBlank(document.getAdditionalReviewerId())) {
            if (document.getArrangementAdHocs() == null) {
                document.setArrangementAdHocs(new ArrayList<>());
            }
            document.getArrangementAdHocs().add(new ArrangementAdHoc(document.getDocumentNumber(),
                networkId, document.getAdditionalReviewerId(), document.getComments()));

            workflowService.adHocRoute(document.getDocumentNumber(), document.getAdditionalReviewerId(),
                "approve", networkId, document.getComments());
        }

        document.setLastUpdateTimetamp(LocalDateTime.now());
        arrangementDocumentRepository.save(document);
        arrangementDocumentRepository.flush();

        return document;
    }

    @Override
    public ArrangementDocument pushback(ArrangementDocument document, String networkId) {
        if (StringUtils.isNotBlank(document.getAdditionalReviewerId())) {
            if (document.getArrangementAdHocs() == null) {
                document.setArrangementAdHocs(new ArrayList<>());
            }

            ArrangementAdHoc adHoc = new ArrangementAdHoc(document.getDocumentNumber(),
                networkId, document.getAdditionalReviewerId(), document.getComments());
            adHoc.setPushback(true);
            document.getArrangementAdHocs().add(adHoc);

            workflowService.adHocRoute(document.getDocumentNumber(), document.getAdditionalReviewerId(),
                "approve", networkId, document.getComments());
        }
        document.setLastUpdateTimetamp(LocalDateTime.now());
        document = arrangementDocumentRepository.save(document);

        document.setWorkflowDocument(workflowService.getWorkflowDocument(document.getDocumentNumber()));

        document.setStatus(document.getWorkflowDocument().getStatus());

        return document;
    }

    @Override
    public ArrangementDocument disapprove(ArrangementDocument document) {
        workflowService.disapprove(document.getDocumentNumber(), document.getComments());

        document.setStatus(STATUS_ABORTED);
        document.setLastUpdateTimetamp(LocalDateTime.now());
        document = arrangementDocumentRepository.save(document);

        document.setWorkflowDocument(workflowService.getWorkflowDocument(document.getDocumentNumber()));

        return document;
    }

    @Override
    public ArrangementDocument save(ArrangementDocument document) {
        workflowService.updateWorkflowDocument(document);

        document = arrangementDocumentRepository.save(document);

        document.setWorkflowDocument(workflowService.getWorkflowDocument(document.getDocumentNumber()));

        return document;
    }

    @Override
    public ArrangementDocument acknowledge(String documentNumber) {
        workflowService.acknowledge(documentNumber, "");

        return getArrangement(documentNumber);
    }

    @Override
    public void updateArrangementStatus(String documentNumber, String newStatus) {
        ArrangementDocument doc = arrangementDocumentRepository.findById(documentNumber).orElse(null);
        if (doc == null) {
            throw new RuntimeException("Unable to find arrangement for document number " + documentNumber);
        }

        doc.setStatus(newStatus);
        doc.setLastUpdateTimetamp(LocalDateTime.now());
        arrangementDocumentRepository.save(doc);
    }

    @Override
    public void completeArrangement(String documentNumber, String newStatus) {
        ArrangementDocument doc = arrangementDocumentRepository.findById(documentNumber).orElse(null);
        if (doc == null) {
            throw new RuntimeException("Unable to find arrangement for document number " + documentNumber);
        }

        expirePreviousJobArrangements(doc);

        doc.setStatus(newStatus);
        doc.setCompletedTimestamp(LocalDateTime.now());
        doc.setLastUpdateTimetamp(LocalDateTime.now());
        arrangementDocumentRepository.save(doc);

        Job job = doc.getJob();

        CompletedArrangement.CompletedArrangementId id = new CompletedArrangement.CompletedArrangementId(job.getEmplid(),
            job.getJobRecordNumber(), job.getJobPositionNumber());
        CompletedArrangement completedArrangement = completedArrangmentRepository.findById(id).orElse(null);
        if (completedArrangement == null) {
            completedArrangement = new CompletedArrangement(job);
        }
        completedArrangement.setCompletedTimetamp(doc.getCompletedTimestamp());
        completedArrangement.setLastUpdateDocumentNumber(doc.getDocumentNumber());
        completedArrangement.setLastUpdateTimetamp(LocalDateTime.now());

        completedArrangmentRepository.save(completedArrangement);

        sendCompletedNotifications(doc);
    }

    protected void expirePreviousJobArrangements(ArrangementDocument doc) {
        LocalDate newStartDate = doc.getRemoteWorkStartDate();

        List<ArrangementDocument> previousDocuments = arrangementDocumentRepository.findCompletedByJobRec(doc.getJob().getEmplid(),
            doc.getJob().getJobRecordNumber());
        for (ArrangementDocument previousDocument: previousDocuments) {
            if (StringUtils.equals(previousDocument.getDocumentNumber(), doc.getDocumentNumber())) {
                continue;
            }

            if (previousDocument.getRemoteWorkEndDate() == null || previousDocument.getRemoteWorkEndDate().isAfter(newStartDate)) {
                LOG.info("Expiring previous arrangement " + previousDocument.getDocumentNumber() + " for " + doc.getJob().getEmplid());

                // if previous start date is after or equal new start date, set end date to previous start date (making inactive)
                if (!previousDocument.getRemoteWorkStartDate().isBefore(newStartDate)) {
                    previousDocument.setRemoteWorkEndDate(previousDocument.getRemoteWorkStartDate());
                } else {
                    previousDocument.setRemoteWorkEndDate(newStartDate.minusDays(1));
                }
                previousDocument.setLastUpdateTimetamp(LocalDateTime.now());
                arrangementDocumentRepository.save(previousDocument);
            }
        }
    }

    private void sendCompletedNotifications(ArrangementDocument doc) {
        sendNotification(doc, getEmployeeNotificationText(doc), RwaConstants.NotificationType.APPROVED, RwaConstants.NotificationTitle.APPROVED, Notification.Priority.NORMAL, getPrimaryActionURL(doc), doc.getEmployee().getNetworkId());
        sendNotification(doc, getSupervisorNotificationText(doc), RwaConstants.NotificationType.APPROVED, RwaConstants.NotificationTitle.APPROVED, Notification.Priority.NORMAL, getPrimaryActionURL(doc), doc.getSupervisor().get("networkId"));
    }

    @Override
    public void sendNotification(ArrangementDocument doc, String text, String notificationType, String notificationTitle, Notification.Priority notificationPriority, String primaryActionURL, String recipient) {
        if (sendNotification) {
            Notification notification = getNotification(doc, text, notificationType, notificationTitle, notificationPriority, primaryActionURL);
            notification.addRecipient(recipient);
            notificationService.sendNotification(notification);
        }
    }

    protected Notification getNotification(ArrangementDocument doc, String text, String notificationType, String notificationTitle, Notification.Priority notificationPriority, String primaryActionURL) {
        String title = doc.getJob().getEmplid() + ", " + doc.getEmployee().getFirstName() + " "
                + doc.getEmployee().getLastName() + ", " + doc.getJob().getJobDepartmentId();

        String description = "Title: " + title + "\n\n";
        description += "Type: Remote Work Arrangement\n\n";
        description += "Document ID: " + doc.getDocumentNumber() + "\n\n\n";
        description += text;

        Notification notification = Notification.builder()
                .notificationType(notificationType)
                .title(notificationTitle)
                .description(description)
                .priority(notificationPriority)
                .primaryActionURL(primaryActionURL).build();

        return notification;
    }

    @Override
    public List<JobArrangementStatus> getJobArrangementStatuses(String networkId) {
        List<JobArrangementStatus> jobArrangementStatuses = new ArrayList<>();

        Person person = personService.getPersonWithJobsByNetworkId(networkId);
        if(person == null) {
            throw new RuntimeException("Unable to get person information for " + networkId);
        }
        List<Job> jobs = person.getJobs();
        if (jobs != null) {
            // remove duplicates
            jobs = new ArrayList(new HashSet<>(jobs));

            for (Job job : jobs) {
                if (ArrayUtils.contains(RwaConstants.JOB_PAYGROUPS, job.getPayGroupCode())) {
                    jobArrangementStatuses.add(getJobArrangementStatus(job));
                }
            }
        }
        return jobArrangementStatuses;
    }

    @Override
    public void deleteArrangement(String documentNumber) {
        ArrangementDocument doc = arrangementDocumentRepository.findById(documentNumber).orElse(null);
        if (doc != null) {
            arrangementDocumentRepository.delete(doc);
        }

        completedArrangmentRepository.deleteByDocumentNumber(documentNumber);
    }

    protected JobArrangementStatus getJobArrangementStatus(Job job) {
        JobArrangementStatus jobArrangementStatus = new JobArrangementStatus(job);

        List<ArrangementDocument> jobDocuments = new ArrayList<>(arrangementDocumentRepository.findByJobId(job.getEmplid(),
            job.getJobRecordNumber(), job.getJobPositionNumber()));
        if (jobDocuments != null && !jobDocuments.isEmpty()) {
            ArrangementDocument latestArrangementDocument = jobDocuments.get(0);
            if (StringUtils.equals(STATUS_COMPLETED, latestArrangementDocument.getStatus())) {
                jobArrangementStatus.setCompletedDocument(new ArrangementStatus(latestArrangementDocument));
            } else {
                jobArrangementStatus.setPendingOrDisapprovedDocument(new ArrangementStatus(latestArrangementDocument));
            }

            jobDocuments.remove(0);
            List<ArrangementStatus> previousDocuments =
                    jobDocuments.stream()
                            .filter(doc -> StringUtils.equals(STATUS_COMPLETED, doc.getStatus())).limit(3)
                            .map(doc -> new ArrangementStatus(doc)).collect(Collectors.toList());

            jobArrangementStatus.setPreviousDocuments(previousDocuments);
        }

        return jobArrangementStatus;
    }

    @Override
    public List<AdminArrangementDto> getArrangements(Map<String, Object> searchParameters) {
        String queryWhereClause = "";

        final String chartCode = (String) searchParameters.get(RwaConstants.ArrangementSearchFields.CHART);
        final List<String> orgCodes = (List<String>) searchParameters.get(RwaConstants.ArrangementSearchFields.ORG);
        final String rcCode = (String) searchParameters.get(RwaConstants.ArrangementSearchFields.RC);

        final String employeeId = (String) searchParameters.get(RwaConstants.ArrangementSearchFields.EMPLID);
        final String supervisorId = (String) searchParameters.get(RwaConstants.ArrangementSearchFields.SUPERVISORID);
        final String currentSupervisorId = (String) searchParameters.get(RwaConstants.ArrangementSearchFields.CURRENTSUPERVISORID);

        if (StringUtils.isNotBlank(rcCode)) {
            List<Organization> organizations = organizationService.getOrganizations();
            List<Organization> filtered = organizations.stream()
                    .filter(o -> StringUtils.equals(o.getResponsibilityCenter(), rcCode))
                    .collect(Collectors.toList());
            List<String> rcValues = filtered.stream()
                    .map(o -> "'" + o.getChartCode() + "-" + o.getCode() + "'")
                    .collect(Collectors.toList());
            String inClause = String.join(",", rcValues);
            queryWhereClause = queryWhereClauseHelper(queryWhereClause) + " a.job.jobDepartmentId in (" + inClause + ")";
        } else {
            if (StringUtils.isNotBlank(chartCode) && orgCodes != null && !orgCodes.isEmpty()) {
                // Handling orgCode as a list
                List<String> orgClauses = orgCodes.stream()
                        .map(orgCode -> "'" + chartCode + "-" + orgCode + "'")
                        .collect(Collectors.toList());
                String orgInClause = String.join(",", orgClauses);
                queryWhereClause = queryWhereClauseHelper(queryWhereClause) + " a.job.jobDepartmentId in (" + orgInClause + ")";
            } else if (StringUtils.isNotBlank(chartCode)) {
                queryWhereClause = queryWhereClauseHelper(queryWhereClause) + " a.job.jobDepartmentId like '" + chartCode + "-%'";
            }
        }

        final String remoteWorkType = (String) searchParameters.get(RwaConstants.ArrangementSearchFields.REMOTEWORKTYPE);
        if (StringUtils.isNotBlank(remoteWorkType)) {
            queryWhereClause = queryWhereClauseHelper(queryWhereClause) + " a.remoteWorkType = '" + remoteWorkType + "'";
        }
        if (StringUtils.isNotBlank(employeeId)) {
            queryWhereClause = queryWhereClauseHelper(queryWhereClause) + " a.createUserId = '" + employeeId + "'";
        }

        if (StringUtils.isNotBlank(supervisorId)) {
            queryWhereClause = queryWhereClauseHelper(queryWhereClause) + " a.supervisorReviewerId = '" + supervisorId + "'";
        }

        Query query
                = entityManager.createQuery(
                "select distinct a.documentNumber, a.job.emplid, a.job.jobPositionNumber, a.job.jobDepartmentId, a.remoteWorkType, " +
                        " a.remoteWorkStartDate, a.remoteWorkEndDate, a.employeeFirstName, a.employeeLastName, " +
                        " a.job.jobRecordNumber, a.status, a.supervisorReviewerId " +
                        " from ArrangementDocument a " +
                        queryWhereClause);

        Query queryCompleted = entityManager.createQuery(
            "select distinct a.documentNumber from ArrangementDocument a " +
                " join CompletedArrangement c on a.documentNumber = c.lastUpdateDocumentNumber " +
                queryWhereClause);

        List<?> documents = query.getResultList();
        List<String> completedDocNumbers = queryCompleted.getResultList();
        List<AdminArrangementDto> results = processArrangementResults(documents, completedDocNumbers);
        if (StringUtils.isNotEmpty(currentSupervisorId)) {
            results = results.stream().filter(s -> StringUtils.equals(s.getCurrentSupervisorId(), currentSupervisorId))
                    .collect(Collectors.toList());
        }
        return results;
    }

    @Override
    public void updateArrangementEndDateByInactiveAndOnChangedSupervisorStep(boolean supervisorChangedReviewEnabled) {
        final LocalDate localDateNow = LocalDate.now();

        List<ArrangementDocument> arrangementDocuments = arrangementDocumentRepository.findCompletedArrangementsWithNoOrFutureEndDate();
        log.info("updateArrangementEndDateByInactiveAndOnChangedSupervisorStep started, arrangementDocuments.size()=" + arrangementDocuments.size()
                + ", supervisorChangedReviewEnabled=" + supervisorChangedReviewEnabled);

        int i = 0;
        int updateCount = 0;
        int supervisorChangeCount = 0;
        for(ArrangementDocument arrangementDocument : arrangementDocuments) {
            Person person;
            try {
                person = personService.getPersonByUniversityId(arrangementDocument.getJob().getEmplid());
                if(person == null) {
                    throw new RuntimeException("Unable to get person information for " +
                            arrangementDocument.getJob().getEmplid());
                }
            } catch (RuntimeException e) {
                if (e.getCause() != null && e.getCause().getMessage() != null &&
                        e.getCause().getMessage().contains(IMS_FAILED_TO_FIND_ACCOUNT)) {
                    // Example: Consultant that left the university
                    logAndSetHelper(localDateNow, arrangementDocument, null, true, false, false, true);
                    updateCount++;
                    break;
                } else {
                    throw e;
                }
            }
            if (person != null && person.getJobs().isEmpty()) {
                logAndSetHelper(localDateNow, arrangementDocument, person, false, false, false, true);
                updateCount++;
            } else if (person == null) {
                logAndSetHelper(localDateNow, arrangementDocument, null, false, false, false, true);
                updateCount++;
            } else {
                // If Supervisor changed, set end date. User will not be notified
                Optional<Job> job = person.getJobs().stream().filter(j -> arrangementDocument.getJob().equals(j)).findAny();

                if (job.isPresent() && StringUtils.equals(RwaConstants.IMS_JOB_FULL_TIME_INDICATOR, job.get().getJobFullPartTimeIndicator())) {
                    Person jobReportsToPerson = null;
                    try {
                        jobReportsToPerson = personService.getPersonByUniversityId(job.get().getReportsToUniversityId());
                        if(jobReportsToPerson == null) {
                            throw new RuntimeException("Unable to get person information for " +
                                    personService.getPersonByUniversityId(job.get().getReportsToUniversityId()));
                        }
                    } catch (RuntimeException e) {
                        if (e.getMessage().contains(IMS_UNABLE_TO_GET_PERSON) ||
                                e.getMessage().contains(IMS_FAILED_TO_FIND_ACCOUNT)) {
                            // Don't print stacktrace, may have left university
                            LOG.info("SKIPPING: IMS reports=" + e.getMessage()
                                    + " for jobReportsToPerson=" + job.get().getReportsToUniversityId()
                                    + " for RWA documentNumber=" + arrangementDocument.getDocumentNumber()
                                    + " and arrangementDocument.getSupervisorReviewerId()=" + arrangementDocument.getSupervisorReviewerId());
                        } else {
                            // Unknown error, print stacktrace
                            LOG.info("SKIPPING: IMS unknown error for jobReportsToPerson=" + job.get().getReportsToUniversityId()
                                    + " for RWA documentNumber=" + arrangementDocument.getDocumentNumber()
                                    + " and arrangementDocument.getSupervisorReviewerId()=" + arrangementDocument.getSupervisorReviewerId(), e);
                        }
                    }

                    if (jobReportsToPerson != null && !StringUtils.equals(arrangementDocument.getSupervisorReviewerId(), jobReportsToPerson.getNetworkId())) {
                        logAndSetHelper(localDateNow, arrangementDocument, person, false, true, true, supervisorChangedReviewEnabled);
                        updateCount++;
                        supervisorChangeCount++;
                    }
                } else {
                    logAndSetHelper(localDateNow, arrangementDocument, person, false, false, false, true);
                    updateCount++;
                }
            }

            if (i++ % 100 == 0) {
                log.info("Loop i=" + i + " out of arrangementDocuments.size()=" + arrangementDocuments.size());
            }
        }

        log.info("updateArrangementEndDateByInactiveAndOnChangedSupervisorStep finished, updateCount=" + updateCount + " of which where supervisorChangeCount=" + supervisorChangeCount);
    }

    @Override
    public List<String> inactivate(List<String> documentNumbers, LocalDate newEndDate){
        List<String> invalid = new ArrayList<String>();
        documentNumbers.stream().forEach(documentNumber -> {
            ArrangementDocument doc = arrangementDocumentRepository.findById(documentNumber).orElse(null);
            if(doc == null){
                invalid.add(documentNumber);
                return;
            }
            if(newEndDate.isBefore(doc.getRemoteWorkStartDate())) {
                invalid.add(documentNumber);
                return;
            }
            doc.setRemoteWorkEndDate(newEndDate);
            arrangementDocumentRepository.save(doc);
        });

        return invalid;
    }

    protected void logAndSetHelper(LocalDate localDate, ArrangementDocument arrangementDocument, Person person, boolean failedFindAccount, boolean activeJobs, boolean supervisorChanged, boolean enabled) {
        log.info((enabled ? "Setting" : "SKIPPING (enabled=false) setting") +
                " remoteWorkEndDate (old value=" + arrangementDocument.getRemoteWorkEndDate() + ") to " + localDate + " for" +
                " documentNumber=" + arrangementDocument.getDocumentNumber() +
                " | networkId=" + (person == null ? "Unable to get person information" : person.getNetworkId()) +
                " | failedFindAccount=" + failedFindAccount +
                " | emplid=" + arrangementDocument.getJob().getEmplid() +
                " | activeJobs=" + activeJobs +
                " | jobRecordNumber=" + arrangementDocument.getJob().getJobRecordNumber() +
                " | jobPositionNumber=" + arrangementDocument.getJob().getJobPositionNumber() +
                " | supervisorChanged=" + supervisorChanged
        );
        if (enabled) {
            arrangementDocument.setRemoteWorkEndDate(localDate);
            arrangementDocument.setEndedDueToSupervisorChange(supervisorChanged);

            arrangementDocumentRepository.save(arrangementDocument);
        }
    }

    private String queryWhereClauseHelper(String queryWhereClause) {
        return queryWhereClause.length() == 0 ? "where " : queryWhereClause + " and";
    }

    private String getSupervisorNotificationText(ArrangementDocument doc) {
        return "Remote Work Arrangement request form for " + doc.getEmployee().getFirstName() + " "
                + doc.getEmployee().getLastName() + " has been APPROVED and is effective as of " +
                formatter.format(doc.getRemoteWorkStartDate()) + ". \n\nYou are being sent this notice as the Supervisor identified on this Arrangement.\n\n\n";
    }

    private String getEmployeeNotificationText(ArrangementDocument doc) {
        return "Thank you for submitting your Remote Work Arrangement request form. This request has been APPROVED and is effective as of " +
                formatter.format(doc.getRemoteWorkStartDate()) + ".\n\n\n" +
                "As a reminder, this Remote Work Arrangement will be reviewed approximately 1 year from the approved effective date above. If you have any questions regarding this form or remote work, please reach out to your supervisor, your unit's HR Business Partner, or contact askHR at [askhr@iu.edu](mailto:askhr@iu.edu)";
    }

    private String getPrimaryActionURL(ArrangementDocument doc) {
        return rwaUrl + "/arrangement/review/" + doc.getDocumentNumber();
    }

    private List<AdminArrangementDto> processArrangementResults(List<?> completedDocuments,
        List<String> completedDocNumbers) {
        List<AdminArrangementDto> completedArrangements = new ArrayList<>();
        Map<String, Organization> chartOrgCodeToOrgMap = organizationService.getOrganizations().stream()
            .collect(Collectors.toMap(o -> o.getChartCode() + "-" + o.getCode(), o -> o));

        Set<EmployeeJobKey> keys = new HashSet<EmployeeJobKey>();
        Set<String> orignalSupervisorIds = new HashSet<String>();
        for (Object row: completedDocuments) {
            Object[] rowFields = (Object[]) row;
            AdminArrangementDto arrangementDto = new AdminArrangementDto();
            String docNumber = (String) rowFields[0];
            arrangementDto.setRwaDocumentNumber(docNumber);
            arrangementDto.setCompleted(completedDocNumbers.contains(docNumber));
            arrangementDto.setRwaRouteLogDocumentNumber((String) rowFields[0]);

            arrangementDto.setJobPositionNumber((String) rowFields[2]);
            if (StringUtils.isNotBlank((String) rowFields[2])) {
                String[] jobDepartment = StringUtils.split((String) rowFields[3], "-");
                arrangementDto.setJobDepartmentChart(jobDepartment[0]);
                arrangementDto.setJobDepartmentOrg(jobDepartment[1]);
                Organization organization = chartOrgCodeToOrgMap.get(rowFields[3]);
                if(organization != null) {
                    arrangementDto.setResponsibilityCenter(organization.getResponsibilityCenter());
                    arrangementDto.setResponsibilityCenterName(organization.getResponsibilityCenterName());
                }
            }
            arrangementDto.setRemoteWorkType(RwaConstants.RemoteWorkType.HYBRID.equals(rowFields[4]) ? HYBRID : FULLY_REMOTE);
            arrangementDto.setRemoteWorkStartDate((LocalDate) rowFields[5]);
            if (rowFields[6] != null) {
                arrangementDto.setRemoteWorkEndDate((LocalDate) rowFields[6]);
            }

            if (rowFields[7] != null && rowFields[8] != null) {
                arrangementDto.setName(rowFields[8] + ", " + rowFields[7]);
            }

            arrangementDto.setEmployeeId((String) rowFields[1]);
            arrangementDto.setJobRecordNumber((Integer) rowFields[9]);
            arrangementDto.setStatus((String) rowFields[10]);
            keys.add(new EmployeeJobKey(arrangementDto));
            if (rowFields[11] != null) {
                String supervisorUsername = (String) rowFields[11];
                orignalSupervisorIds.add(supervisorUsername);
                arrangementDto.setSupervisor(supervisorUsername);
            }

            completedArrangements.add(arrangementDto);
        }

        List<Person> originalSupervisors = getPersonWithNetworkId(new ArrayList<>(orignalSupervisorIds));
        Map<String, Person> supervisorById = originalSupervisors.stream().collect(Collectors.toMap(
                s -> s.getNetworkId(), s -> s));
        Map<EmployeeJobKey, Person> currentSupervisorByKey =  getCurrentSupervisorByEmployee(new ArrayList<>(keys));

        for (AdminArrangementDto  arrangement: completedArrangements) {
            Person supervisor = supervisorById.get(arrangement.getSupervisor());
            if(supervisor != null){
                arrangement.setSupervisor(supervisor.getPreferredName());
            }

            Person currentSupervisor = currentSupervisorByKey.get(new EmployeeJobKey(arrangement));
            if(currentSupervisor == null){
                arrangement.setCurrentSupervisor("None");
            } else {
                arrangement.setCurrentSupervisor(currentSupervisor.getPreferredName());
                arrangement.setCurrentSupervisorId(currentSupervisor.getNetworkId());
            }

        }
        return completedArrangements;
    }

    private Map<EmployeeJobKey, Person> getCurrentSupervisorByEmployee(List<EmployeeJobKey> keys) {
        Map<EmployeeJobKey, Person> supervisorByEmployee = new HashMap<>();

        if(keys == null || keys.isEmpty()) {
            return supervisorByEmployee;
        }
        Map<String, List<EmployeeJobKey>> keysByEmplid = keys.stream().collect(Collectors.groupingBy(
                k -> k.getEmployeeId()));

        List<Person> employees = getPersonWithUniversityId(new ArrayList<>(keysByEmplid.keySet()));
        Map<EmployeeJobKey, String> supIdByEmpId = new HashMap<>();
        Set<String> supervisorIds = new HashSet<>();
        for(Person employee : employees) {
            for(EmployeeJobKey key : keysByEmplid.get(employee.getUniversityId())) {
                if(key == null){
                    continue;
                }
                Job currentJob = RwaUtils.getCurrentJob(employee, key);
                if (currentJob == null) {
                    continue;
                }
                String supervisorUniversityId = currentJob.getReportsToUniversityId();
                supervisorIds.add(supervisorUniversityId);
                supIdByEmpId.put(key, supervisorUniversityId);
            }
        }

        List<Person> supervisors = getPersonWithUniversityId(new ArrayList<>(supervisorIds));
        Map<String, Person> supervisorById = supervisors.stream().collect(Collectors.toMap(
                s -> s.getUniversityId(), s -> s));
        for(EmployeeJobKey key : supIdByEmpId.keySet()) {
            String supId = supIdByEmpId.get(key);
            if(StringUtils.isEmpty(supId)) {
                continue;
            }
            Person supervisor = supervisorById.get(supId);
            if(supervisor == null) {
                continue;
            }
            supervisorByEmployee.put(key, supervisor);
        }

        return supervisorByEmployee;
    }

    private List<Person> getPersonWithNetworkId(List<String> networkIds){
        if(networkIds == null || networkIds.isEmpty()){
            return new ArrayList<Person>();
        }

        List<List<String>> partitions = RwaUtils.partitionToStreams(networkIds, NUM_STREAMS);

        List<Person> results = new ArrayList<Person>();
        List<List<Person>> resultPartitions = partitions.parallelStream().map( values -> {
            List<Person> partition = new ArrayList<Person>();
            for (String networkId : values) {
                Person result = personService.getPersonByNetworkId(networkId);
                if (result == null) {
                    continue;
                }
                partition.add(result);
            }
            return partition;
        }).collect(Collectors.toList());
        resultPartitions.stream().forEach(partition -> {
            results.addAll(partition);
        });
        return results;
    }

    private List<Person> getPersonWithUniversityId(List<String> universityIds){
        if(universityIds == null || universityIds.isEmpty()){
            return new ArrayList<Person>();
        }

        List<List<String>> partitions = RwaUtils.partitionToStreams(universityIds, NUM_STREAMS);

        List<Person> results = new ArrayList<Person>();
        List<List<Person>> resultPartitions = partitions.parallelStream().map( values -> {
            List<Person> partition = new ArrayList<Person>();
            for (String universityId : values) {
                Person result = personService.getPersonByUniversityId(universityId);
                if (result == null) {
                    continue;
                }
                partition.add(result);
            }
            return partition;
        }).collect(Collectors.toList());
        resultPartitions.stream().forEach(partition -> {
            results.addAll(partition);
        });
        return results;
    }

    public List<ArrangementDocument> getOldArrangements(String networkId) {
        Person person = personService.getPersonWithJobsByNetworkId(networkId);
        if(person == null) {
            throw new RuntimeException("Unable to get person information for " + networkId);
        }
        List<Job> jobs = person.getJobs();
        //Need to find documents that were not found with active jobs above (documents from inactive jobs)
        List<ArrangementDocument> arrangementDocuments = arrangementDocumentRepository.findByEmplId(person.getUniversityId());
        arrangementDocuments.removeIf(arrangementDocument -> jobs.contains(arrangementDocument.getJob()));
        return arrangementDocuments;
    }
}
