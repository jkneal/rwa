package edu.iu.es.ebs.rwa.controllers;

import edu.iu.es.ebs.rwa.RwaConstants;
import edu.iu.es.ebs.rwa.domain.ArrangementDocument;
import edu.iu.es.ebs.rwa.domain.ArrangementStatus;
import edu.iu.es.ebs.rwa.domain.Job;
import edu.iu.es.ebs.rwa.domain.JobArrangementStatus;
import edu.iu.es.ebs.rwa.domain.KeyValuePair;
import edu.iu.es.ebs.rwa.domain.WorkflowAction;
import edu.iu.es.ebs.rwa.exceptions.AuthorizationException;
import edu.iu.es.ebs.rwa.repositories.ArrangementDocumentRepository;
import edu.iu.es.ebs.rwa.service.ArrangementService;
import edu.iu.es.ebs.rwa.service.AuthorizationService;
import edu.iu.es.ebs.rwa.service.WorkflowService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static edu.iu.es.ebs.rwa.domain.WorkflowDocument.STATUS_COMPLETED;

@RestController
@RequestMapping("/api/arrangement")
public class ArrangementController {

    @Autowired
    protected ArrangementService arrangementService;

    @Autowired
    protected AuthorizationService authorizationService;

    @Autowired
    protected ArrangementDocumentRepository arrangementDocumentRepository;

    @Autowired
    private WorkflowService workflowService;

    DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

    @GetMapping("/{documentNumber}/details")
    public Map<String, Object> getArrangementDetails(@PathVariable String documentNumber) {
        ArrangementDocument document = arrangementDocumentRepository.findByDocumentNumber(documentNumber);
        
        Map<String, Object> details = new HashMap<>();
        if (document != null) {
            details.put("documentNumber", document.getDocumentNumber());
            details.put("status", document.getStatus());
            details.put("employee", document.getEmployee());
            details.put("remoteWorkStartDate", document.getRemoteWorkStartDate());
            details.put("remoteWorkEndDate", document.getRemoteWorkEndDate());
            details.put("workArrangementType", document.getWorkArrangementType());
            details.put("createdTimestamp", document.getCreatedTimestamp());
        }
        
        return details;
    }

    @RequestMapping(method = RequestMethod.POST)
    public ArrangementDocument createNewArrangement(@RequestBody Job job) {
        if (!authorizationService.canCreateArrangement(job)) {
            throw new AuthorizationException("User " + getCurrentNetworkId() +
                " is not authorized to create arrangement for this job ");
        }

        return arrangementService.createArrangement(job, getCurrentNetworkId());
    }

    @RequestMapping(value = "/inactivate", method = RequestMethod.POST)
    public Map<String, Object> inactivateArrangements(@RequestBody Map<String, Object>  parameters) {
        if (!authorizationService.isAdmin()) {
            throw new AuthorizationException("User " + getCurrentNetworkId() +
                    " is not authorized to for inactivation action ");
        }
        List<String> ids = (List<String>) parameters.get("ids");
        String inActivationDateStr = (String) parameters.get("inactivationDate");
        LocalDate inActivationDate = LocalDate.parse(inActivationDateStr, formatter);

        List<String> invalidIds = arrangementService.inactivate(ids, inActivationDate);

        Map<String, Object> status = new HashMap<>();
        status.put("invalid", invalidIds);
        return status;
    }

    @RequestMapping("/{documentNumber}")
    public ArrangementDocument getArrangement(@PathVariable("documentNumber") String documentNumber) {
        ArrangementDocument document = arrangementService.getArrangement(documentNumber);

        if (!authorizationService.canViewArrangement(document)) {
            throw new AuthorizationException("User " + getCurrentNetworkId() + " is not authorized to view arrangement "
                + documentNumber);
        }

        return document;
    }

    @RequestMapping("/employee/{networkId}")
    public List<KeyValuePair> getArrangementsByEmployee(@PathVariable("networkId") String networkId) {
        List<KeyValuePair> arrangements = new ArrayList<>();

        List<JobArrangementStatus> statuses = arrangementService.getJobArrangementStatuses(networkId);
        for (JobArrangementStatus status: statuses) {
            ArrangementStatus completedStatus = status.getCompletedDocument();
            if (completedStatus == null && status.getPreviousDocuments() != null) {
                for (ArrangementStatus previousStatus: status.getPreviousDocuments()) {
                    if (StringUtils.equals(STATUS_COMPLETED, previousStatus.getStatus())) {
                        completedStatus = previousStatus;
                        break;
                    }
                }
            }

            if (completedStatus != null) {
                String key = completedStatus.getDocumentNumber();
                String value = completedStatus.getJob().getJobTitle() + " (" + completedStatus.getJob().getJobDepartmentId();
                value += ", Rec " + completedStatus.getJob().getJobRecordNumber() + ")";
                value += " - " + completedStatus.getRemoteWorkType();

                arrangements.add(new KeyValuePair(key, value));
            }
        }

        return arrangements;
    }

    @RequestMapping(value = "/{documentNumber}", method = RequestMethod.DELETE)
    public Map<String, Boolean> deleteArrangement(@PathVariable("documentNumber") String documentNumber) {
        if (!StringUtils.equals(RwaConstants.AFT_USER, getCurrentNetworkId()) || authorizationService.isPrd()) {
            throw new RuntimeException("Unauthorized to delete document " + documentNumber);
        }

        arrangementService.deleteArrangement(documentNumber);

        Map<String, Boolean> status = new HashMap<>();
        status.put("success", true);
        return status;
    }

    @RequestMapping("/{documentNumber}/update")
    public ArrangementDocument updateArrangement(@PathVariable("documentNumber") String documentNumber) {
        ArrangementDocument document = arrangementService.updateArrangement(documentNumber, getCurrentNetworkId());

        if (!authorizationService.canCreateArrangement(document.getJob())) {
            throw new AuthorizationException("User " + getCurrentNetworkId() +
                " is not authorized to create arrangement for this job ");
        }

        return document;
    }

    @RequestMapping(value = "/submit", method = RequestMethod.POST)
    public ArrangementDocument submitArrangement(@RequestBody ArrangementDocument document) {
        return arrangementService.route(document);
    }

    @RequestMapping(value = "/{documentNumber}/approve", method = RequestMethod.POST)
    public ArrangementDocument approveArrangement(@RequestBody ArrangementDocument document) {
        ArrangementDocument approveDocument = arrangementService.approve(document, getCurrentNetworkId());

        workflowService.approve(approveDocument.getDocumentNumber(), approveDocument.getComments());

        approveDocument.setWorkflowDocument(workflowService.getWorkflowDocument(approveDocument.getDocumentNumber()));
        approveDocument.setStatus(approveDocument.getWorkflowDocument().getStatus());

        return approveDocument;
    }

    @RequestMapping(value = "/{documentNumber}/pushback", method = RequestMethod.POST)
    public ArrangementDocument pushbackArrangement(@RequestBody ArrangementDocument document) {
        return arrangementService.pushback(document, getCurrentNetworkId());
    }

    @RequestMapping(value = "/{documentNumber}/disapprove", method = RequestMethod.POST)
    public ArrangementDocument disapproveArrangement(@RequestBody ArrangementDocument document) {
        return arrangementService.disapprove(document);
    }

    @RequestMapping(value = "/{documentNumber}/save", method = RequestMethod.POST)
    public ArrangementDocument saveArrangement(@RequestBody ArrangementDocument document) {
        return arrangementService.save(document);
    }

    @RequestMapping(value = "/{documentNumber}/acknowledge", method = RequestMethod.POST)
    public ArrangementDocument acknowledgeArrangement(@PathVariable("documentNumber") String documentNumber) {
        return arrangementService.acknowledge(documentNumber);
    }

    @RequestMapping("/{documentNumber}/actions")
    public List<WorkflowAction> getWorkflowActions(@PathVariable("documentNumber") String documentNumber) {
        return arrangementService.getActionsTaken(documentNumber);
    }

    protected String getCurrentNetworkId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

}
