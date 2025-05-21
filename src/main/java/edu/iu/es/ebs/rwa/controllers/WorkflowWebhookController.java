package edu.iu.es.ebs.rwa.controllers;

import edu.iu.es.ebs.rwa.domain.WorkflowStatusChangeEvent;
import edu.iu.es.ebs.rwa.service.ArrangementService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@ConditionalOnProperty(name = "webhook.users.rice.password")
public class WorkflowWebhookController {

    public static final String WEBHOOK_PATH = "/api/rwa/webhook";

    @Autowired
    ArrangementService arrangementService;

    /**
     * Invoked by Kuali Rice each time the route status changes on the associated document
     *
     * @param workflowStatusChangeEvent map of values with resource pool identification and status delta
     */
    @PostMapping(value = WEBHOOK_PATH)
    public void webhook(@RequestBody WorkflowStatusChangeEvent workflowStatusChangeEvent) {
        if (workflowStatusChangeEvent.getNewStatus().equals(WorkflowStatusChangeEvent.ProcessInstanceStatus.COMPLETED) && !workflowStatusChangeEvent.getOldStatus().equals(WorkflowStatusChangeEvent.ProcessInstanceStatus.COMPLETED)) {
            log.info("Kuali Rice document " + workflowStatusChangeEvent.getProcessInstanceId() + " has moved into a completed state");
            arrangementService.completeArrangement(workflowStatusChangeEvent.getProcessInstanceId(),
                workflowStatusChangeEvent.getNewStatus().getCode());
        } else if (workflowStatusChangeEvent.getNewStatus().equals(WorkflowStatusChangeEvent.ProcessInstanceStatus.ABORTED) ||
            workflowStatusChangeEvent.getNewStatus().equals(WorkflowStatusChangeEvent.ProcessInstanceStatus.SUSPENDED)) {
            arrangementService.updateArrangementStatus(workflowStatusChangeEvent.getProcessInstanceId(),
                workflowStatusChangeEvent.getNewStatus().getCode());
        } else {
            log.warn("Found unknown status change event: " + workflowStatusChangeEvent.toString());
        }

        log.info(String.format("Successfully processed %s", workflowStatusChangeEvent.toString()));
    }

}
