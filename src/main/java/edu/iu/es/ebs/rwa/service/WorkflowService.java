package edu.iu.es.ebs.rwa.service;

import edu.iu.es.ebs.rwa.domain.ArrangementDocument;
import edu.iu.es.ebs.rwa.domain.WorkflowAction;
import edu.iu.es.ebs.rwa.domain.WorkflowDocument;
import org.springframework.web.client.RestTemplate;

import java.util.List;

public interface WorkflowService {

    void createWorkflowDocument(ArrangementDocument arrangementDocument);

    void updateWorkflowDocument(ArrangementDocument arrangementDocument);

    WorkflowDocument getWorkflowDocument(String processId);

    WorkflowDocument getWorkflowDocument(String processId, RestTemplate restTemplate);

    List<WorkflowAction> getWorkflowActions(String processId);

    boolean route(String documentNumber);

    boolean approve(String documentNumber, String annotation);

    boolean disapprove(String documentNumber, String annotation);

    boolean complete(String documentNumber, String annotation);

    boolean acknowledge(String documentNumber, String annotation);

    boolean cancel(String documentNumber, String annotation);

    boolean cancel(String documentNumber, String annotation, RestTemplate restTemplate);

    boolean adHocRoute(String documentNumber, String recipient, String type, String networkId, String annotation);

    Boolean health();
}
