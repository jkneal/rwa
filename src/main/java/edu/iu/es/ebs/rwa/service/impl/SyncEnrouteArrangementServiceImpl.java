package edu.iu.es.ebs.rwa.service.impl;

import edu.iu.es.ebs.rwa.RwaConstants;
import edu.iu.es.ebs.rwa.domain.ArrangementDocument;
import edu.iu.es.ebs.rwa.domain.Job;
import edu.iu.es.ebs.rwa.domain.Person;
import edu.iu.es.ebs.rwa.domain.WorkflowDocument;
import edu.iu.es.ebs.rwa.repositories.ArrangementDocumentRepository;
import edu.iu.es.ebs.rwa.service.SyncEnrouteArrangementService;
import edu.iu.es.ebs.rwa.service.PersonService;
import edu.iu.es.ebs.rwa.service.WorkflowService;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class SyncEnrouteArrangementServiceImpl implements SyncEnrouteArrangementService {
    private final Log LOG = LogFactory.getLog(this.getClass());
    private static final String CANCEL_REASON_WORKFLOW_CANCEL = "Canceled after workflow cancel";
    private static final String CANCEL_REASON_YEAR_INACTIVITY = "Canceled after a year of inactivity";
    private static final String CANCEL_REASON_INACTIVE_EMPLOYEE = "Canceled, initiator / employee no longer active";
    private static final String CANCEL_REASON_INACTIVE_APPROVER = "Canceled, approver no longer active";
    private static final String CANCEL_REASON_INACTIVE_JOB = "Canceled, job record or position number not valid";

    @Value("${workflow.url}")
    private String workflowUrl;

    @Lazy
    @Autowired
    @Qualifier("batchRestTemplate")
    private RestTemplate restTemplate;

    @Autowired
    private WorkflowService workflowService;

    @Autowired
    private PersonService personService;

    @Autowired
    private ArrangementDocumentRepository arrangementDocumentRepository;

    @Override
    public void sync(List<ArrangementDocument> arrangementDocuments, Boolean syncOlderOneYearEnrouteArrangementsEnabled) {
        LOG.info("sync starting, arrangementDocuments.size()=" + arrangementDocuments.size());

        int i = 0;
        for (ArrangementDocument arrangementDocument : arrangementDocuments) {
            final String workflowDocumentStatus;
            try {
                workflowDocumentStatus = workflowService.getWorkflowDocument(arrangementDocument.getDocumentNumber(), restTemplate).getStatus();
            } catch (RuntimeException e) {
                LOG.error("Skipping because error fetching workflowDocumentStatus for documentNumber=" + arrangementDocument.getDocumentNumber() + ",e.getMessage()=" + e.getMessage());
                continue;
            }

            if (WorkflowDocument.STATUS_COMPLETED.equals(workflowDocumentStatus)) {
                completeArrangementAlreadyUpdatedInWorkflow(syncOlderOneYearEnrouteArrangementsEnabled, arrangementDocument, workflowDocumentStatus);
            } else if (WorkflowDocument.STATUS_ABORTED.equals(workflowDocumentStatus)) {
                cancelArrangementAlreadyUpdatedInWorkflow(syncOlderOneYearEnrouteArrangementsEnabled, arrangementDocument, workflowDocumentStatus);
            } else {
                logMessageHelper(syncOlderOneYearEnrouteArrangementsEnabled, arrangementDocument, "CANCEL_REASON_YEAR_INACTIVITY",
                        ",createTimestamp=" + arrangementDocument.getCreateTimestamp());

                if (syncOlderOneYearEnrouteArrangementsEnabled) {
                    cancelArrangement(arrangementDocument, CANCEL_REASON_YEAR_INACTIVITY);

                    if (!workflowTakeActionCancelWithSystemUser(arrangementDocument.getDocumentNumber(), CANCEL_REASON_YEAR_INACTIVITY)) {
                        throw new RuntimeException("workflowTakeActionCancelWithSystemUser failed on documentNumber="
                                + arrangementDocument.getDocumentNumber());
                    }
                }
            }

            if (i++ % 100 == 0) {
                LOG.info("Loop i=" + i + " out of arrangementDocuments.size()=" + arrangementDocuments.size());
            }
        }

        LOG.info("sync finished, i=" + i);
    }

    @Override
    public void reviewAndSync(List<ArrangementDocument> arrangementDocuments, Boolean syncInactiveDataEnrouteArrangementsEnabled) {
        LOG.info("reviewAndSync starting, arrangementDocuments.size()=" + arrangementDocuments.size());

        int i = 0;
        for (ArrangementDocument arrangementDocument : arrangementDocuments){
            final String workflowDocumentStatus;
            try {
                workflowDocumentStatus = workflowService.getWorkflowDocument(arrangementDocument.getDocumentNumber(), restTemplate).getStatus();
            } catch (RuntimeException e) {
                LOG.error("Skipping because error fetching workflowDocumentStatus for documentNumber=" + arrangementDocument.getDocumentNumber() + ",e.getMessage()=" + e.getMessage());
                i++;
                continue;
            }
            // Careful about what personService method to use on the next line, not all of them return isEmployee
            // which is important for the employee check
            final Person employee = personService.getPersonByNetworkId(arrangementDocument.getCreateUserId());

            if (WorkflowDocument.STATUS_COMPLETED.equals(workflowDocumentStatus)) {
                completeArrangementAlreadyUpdatedInWorkflow(syncInactiveDataEnrouteArrangementsEnabled, arrangementDocument, workflowDocumentStatus);
            } else if (WorkflowDocument.STATUS_ABORTED.equals(workflowDocumentStatus)) {
                cancelArrangementAlreadyUpdatedInWorkflow(syncInactiveDataEnrouteArrangementsEnabled, arrangementDocument, workflowDocumentStatus);
            } else if (employee == null || !employee.isEmployee()) {
                logMessageHelper(syncInactiveDataEnrouteArrangementsEnabled, arrangementDocument, "CANCEL_REASON_INACTIVE_EMPLOYEE",
                        ",createUserId=" + arrangementDocument.getCreateUserId());

                if (syncInactiveDataEnrouteArrangementsEnabled) {
                    cancelArrangement(arrangementDocument, CANCEL_REASON_INACTIVE_EMPLOYEE);
                    if (!workflowTakeActionCancelWithSystemUser(arrangementDocument.getDocumentNumber(), CANCEL_REASON_INACTIVE_EMPLOYEE)) {
                        throw new RuntimeException("workflowTakeActionCancelWithSystemUser failed on documentNumber="
                                + arrangementDocument.getDocumentNumber());
                    }
                }
            } else {
                final Person supervisor = personService.getPersonByNetworkId(arrangementDocument.getSupervisorReviewerId());
                Person hrReviewer = null;
                if(arrangementDocument.getHrReviewerId() != null) {
                    hrReviewer = personService.getPersonByNetworkId(arrangementDocument.getHrReviewerId());
                }

                if ((supervisor != null && !supervisor.isEmployee()) || (hrReviewer != null && !hrReviewer.isEmployee())) {
                    // ignore nulls because supervisor and hrReviewer are required but hrReviewer is not set until
                    // supervisor route node
                    logMessageHelper(syncInactiveDataEnrouteArrangementsEnabled, arrangementDocument, "CANCEL_REASON_INACTIVE_APPROVER",
                            ",supervisorReviewerId=" + arrangementDocument.getSupervisorReviewerId() + ",hrReviewerId=" + arrangementDocument.getHrReviewerId());

                    if (syncInactiveDataEnrouteArrangementsEnabled) {
                        cancelArrangement(arrangementDocument, CANCEL_REASON_INACTIVE_APPROVER);
                        if (!workflowTakeActionCancelWithSystemUser(arrangementDocument.getDocumentNumber(), CANCEL_REASON_INACTIVE_APPROVER)) {
                            throw new RuntimeException("workflowTakeActionCancelWithSystemUser failed on documentNumber="
                                    + arrangementDocument.getDocumentNumber());
                        }
                    }
                } else {
                    // Careful about what personService method to use on the next line, not all of them return jobs
                    // which is important for checking the jobs
                    final Person employeeJobs = personService.getPersonByUniversityId(arrangementDocument.getJob().getEmplid());

                    Optional<Job> job = Optional.empty();
                    if (employeeJobs != null && employeeJobs.getJobs() != null && !employeeJobs.getJobs().isEmpty()) {
                        job = employeeJobs.getJobs().stream().filter(j -> arrangementDocument.getJob().equals(j)).findAny();
                    }

                    if (job.isEmpty() || StringUtils.isBlank(job.get().getJobPositionNumber())) {
                        logMessageHelper(syncInactiveDataEnrouteArrangementsEnabled, arrangementDocument, "CANCEL_REASON_INACTIVE_JOB",
                                ",createUserId=" + arrangementDocument.getCreateUserId());

                        if (syncInactiveDataEnrouteArrangementsEnabled) {
                            cancelArrangement(arrangementDocument, CANCEL_REASON_INACTIVE_JOB);
                            if (!workflowTakeActionCancelWithSystemUser(arrangementDocument.getDocumentNumber(), CANCEL_REASON_INACTIVE_JOB)) {
                                throw new RuntimeException("workflowTakeActionCancelWithSystemUser failed on documentNumber="
                                        + arrangementDocument.getDocumentNumber());
                            }
                        }
                    }
                }
            }

            if (i++ % 100 == 0) {
                LOG.info("Loop i=" + i + " out of arrangementDocuments.size()=" + arrangementDocuments.size());
            }
        }

        LOG.info("reviewAndSync finished, i=" + i);
    }

    private void completeArrangementAlreadyUpdatedInWorkflow(Boolean enabled, ArrangementDocument arrangementDocument, String workflowDocumentStatus) {
        LOG.warn("Found " + workflowDocumentStatus + " workflow document #" + arrangementDocument.getDocumentNumber()
                + " but status=" + arrangementDocument.getStatus() + " in RWA. "
                + (enabled ? "Setting" : "SKIPPING (enabled=false) setting")
                + " completed in RWA.");

        if (enabled) {
            arrangementDocument.setStatus(WorkflowDocument.STATUS_COMPLETED);
            arrangementDocumentRepository.save(arrangementDocument);
        }
    }

    private void cancelArrangementAlreadyUpdatedInWorkflow(Boolean enabled, ArrangementDocument arrangementDocument, String workflowDocumentStatus) {
        // Workflow canceling a document that is already cancelled causes the workflow API to give a 500 error
        LOG.warn("Found " + workflowDocumentStatus + " workflow document #" + arrangementDocument.getDocumentNumber()
                + " but status=" + arrangementDocument.getStatus() + " in RWA. "
                + (enabled ? "Setting" : "SKIPPING (enabled=false) setting")
                + " cancelled in RWA (CANCEL_REASON_WORKFLOW_CANCEL).");

        if (enabled) {
            cancelArrangement(arrangementDocument, CANCEL_REASON_WORKFLOW_CANCEL);
        }
    }

    private void logMessageHelper(Boolean enabled, ArrangementDocument arrangementDocument, String reason, String extra) {
        LOG.info((enabled ? "Workflow cancelling" : "SKIPPING (enabled=false) workflow cancelling") +
                " due to " + reason + " documentNumber=" + arrangementDocument.getDocumentNumber() + extra);
    }

    /**
     * WorkflowWebhookController should already update arrangement for us but to avoid sync issues, we have this helper
     * to update the RWA status too
     * @param arrangementDocument to cancel
     * @param cancelReason to give as reason
     */
    private void cancelArrangement(ArrangementDocument arrangementDocument, String cancelReason) {
        arrangementDocument.setStatus(WorkflowDocument.STATUS_ABORTED);
        arrangementDocument.setDisapproveReason(cancelReason);
        arrangementDocumentRepository.save(arrangementDocument);
    }

    @SuppressWarnings("BooleanMethodIsAlwaysInverted")
    protected boolean workflowTakeActionCancelWithSystemUser(String documentNumber, String cancelReason) {
        Map<String, String> requestParameters = new HashMap<>();
        requestParameters.put("type", RwaConstants.WorkflowActionTypes.CANCEL);
        requestParameters.put("annotation", cancelReason);
        requestParameters.put("priority", "0");
        try {
            String url = String.format("%s/processInstances/%s/actions", workflowUrl, documentNumber);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(requestParameters), Map.class);
            return response.getStatusCode() == HttpStatus.CREATED;
        } catch (Exception ex) {
            LOG.error(ex);
            throw new RuntimeException(ex);
        }
    }
}
