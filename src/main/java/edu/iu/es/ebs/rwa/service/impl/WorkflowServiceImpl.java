package edu.iu.es.ebs.rwa.service.impl;

import edu.iu.es.ebs.rwa.RwaConstants;
import edu.iu.es.ebs.rwa.domain.ArrangementDocument;
import edu.iu.es.ebs.rwa.domain.WorkflowAction;
import edu.iu.es.ebs.rwa.domain.WorkflowActionsResponse;
import edu.iu.es.ebs.rwa.domain.WorkflowDocument;
import edu.iu.es.ebs.rwa.service.WorkflowService;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WorkflowServiceImpl implements WorkflowService {
    protected final Log logger = LogFactory.getLog(this.getClass());

    @Value("${workflow.url}")
    private String workflowUrl;

    @Autowired
    @Qualifier("authenticatedRestTemplate")
    private RestTemplate restTemplate;

    @Override
    public void createWorkflowDocument(ArrangementDocument arrangementDocument) {
        HttpEntity<Map<String, Object>> processRequest = createWorkflowProcessRequest(arrangementDocument);
        ResponseEntity<WorkflowDocument> response = restTemplate.postForEntity(workflowUrl + "/processInstances",
            processRequest, WorkflowDocument.class);

        if (!response.getStatusCode().equals(HttpStatus.CREATED)) {
            throw new RuntimeException("Arrangement document was not created for " + arrangementDocument.getJob().getEmplid()
                + response.getStatusCode().toString());
        }

        WorkflowDocument workflowDocument = response.getBody();
        arrangementDocument.setWorkflowDocument(workflowDocument);
        arrangementDocument.setDocumentNumber(workflowDocument.getId());
    }

    @Override
    public void updateWorkflowDocument(ArrangementDocument arrangementDocument) {
        HttpEntity<Map<String, Object>> processRequest = createWorkflowProcessRequest(arrangementDocument);
        ResponseEntity<WorkflowDocument> response = restTemplate.exchange(workflowUrl +
                "/processInstances/" + arrangementDocument.getDocumentNumber(), HttpMethod.PUT, processRequest,
            WorkflowDocument.class);

        if (!response.getStatusCode().equals(HttpStatus.OK)) {
            throw new RuntimeException("Arrangement document was not updated for " + arrangementDocument.getJob().getEmplid()
                + response.getStatusCode().toString());
        }

        WorkflowDocument workflowDocument = response.getBody();
        arrangementDocument.setWorkflowDocument(workflowDocument);
        arrangementDocument.setDocumentNumber(workflowDocument.getId());
    }

    protected HttpEntity<Map<String, Object>> createWorkflowProcessRequest(ArrangementDocument arrangementDocument) {
        Map<String, Object> workflowRequest = new HashMap<>();
        workflowRequest.put("processType", RwaConstants.WORK_ARRANGEMENT_DOC_TYPE);

        String title = arrangementDocument.getJob().getEmplid() + ", " + arrangementDocument.getEmployee().getFirstName() + " "
            + arrangementDocument.getEmployee().getLastName() + ", " + arrangementDocument.getJob().getJobDepartmentId();
        workflowRequest.put("title", title);

        Map<String, Object> content = new HashMap<>();
        workflowRequest.put("content", content);

        Map<String, Object> attributes = new HashMap<>();

        Map<String, Object> networkIdAttribute = new HashMap<>();
        networkIdAttribute.put("supervisorNetworkId", arrangementDocument.getSupervisorReviewerId());
        networkIdAttribute.put("hrNetworkId", arrangementDocument.getHrReviewerId());
        attributes.put("NetworkIdRoleAttribute", networkIdAttribute);

        workflowRequest.put("attributes", attributes);

        HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.setContentType(MediaType.APPLICATION_JSON);

        return new HttpEntity<>(workflowRequest, requestHeaders);
    }

    @Override
    public WorkflowDocument getWorkflowDocument(String processId) {
        return getWorkflowDocument(processId, restTemplate);
    }

    @Override
    public WorkflowDocument getWorkflowDocument(String processId, RestTemplate restTemplate) {
        ResponseEntity<WorkflowDocument> response = restTemplate.getForEntity(workflowUrl + "/processInstances/"
                + processId, WorkflowDocument.class);

        if (!response.getStatusCode().equals(HttpStatus.OK)) {
            throw new RuntimeException("Unable to load workflow document for id: " + processId);
        }

        return response.getBody();
    }

    @Override
    public List<WorkflowAction> getWorkflowActions(String processId) {
        ResponseEntity<WorkflowActionsResponse> response = restTemplate.getForEntity(workflowUrl + "/processInstances/"
            + processId + "/actions", WorkflowActionsResponse.class);

        if (!response.getStatusCode().equals(HttpStatus.OK)) {
            throw new RuntimeException("Unable to load workflow actions for id: " + processId);
        }

        WorkflowActionsResponse workflowActionsResponse = response.getBody();

        return workflowActionsResponse.get_embedded().getActions();
    }

    @Override
    public boolean adHocRoute(String documentNumber, String recipient, String type, String networkId, String annotation) {
        Map<String, String> requestParameters = new HashMap<>();
        if (StringUtils.isBlank(annotation)) {
            annotation = "";
        }
        if (StringUtils.equals(type, "fyi")) {
            annotation = String.format("FYI requested by %s. ", networkId) + annotation;
        } else {
            annotation = String.format("Ad Hoc requested by %s. ", networkId) + annotation;
        }
        requestParameters.put("annotation", annotation);
        requestParameters.put("targetActionType", type);
        requestParameters.put("type", "adHocToPerson");
        requestParameters.put("priority", "0");
        requestParameters.put("target", recipient);
        try {
            String url = String.format("%s/processInstances/%s/actions", workflowUrl, documentNumber.toString());
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(requestParameters), Map.class);
            return response.getStatusCode() == HttpStatus.CREATED;
        } catch (Exception ex) {
            logger.error(ex);
            throw new RuntimeException(ex);
        }
    }

    @Override
    public boolean route(String documentNumber) {
        return takeAction(documentNumber, RwaConstants.WorkflowActionTypes.ROUTE, "", restTemplate);
    }

    @Override
    public boolean approve(String documentNumber, String annotation) {
        return takeAction(documentNumber, RwaConstants.WorkflowActionTypes.APPROVE, annotation, restTemplate);
    }

    @Override
    public boolean disapprove(String documentNumber, String annotation) {
        return takeAction(documentNumber, RwaConstants.WorkflowActionTypes.DISAPPROVE, annotation, restTemplate);
    }

    @Override
    public boolean complete(String documentNumber, String annotation) {
        return takeAction(documentNumber, RwaConstants.WorkflowActionTypes.COMPLETE, annotation, restTemplate);
    }

    @Override
    public boolean acknowledge(String documentNumber, String annotation) {
        return takeAction(documentNumber, RwaConstants.WorkflowActionTypes.ACKNOWLEDGE, annotation, restTemplate);
    }

    @Override
    public boolean cancel(String documentNumber, String annotation) {
        return takeAction(documentNumber, RwaConstants.WorkflowActionTypes.CANCEL, annotation, restTemplate);
    }

    @Override
    public boolean cancel(String documentNumber, String annotation, RestTemplate restTemplate) {
        return takeAction(documentNumber, RwaConstants.WorkflowActionTypes.CANCEL, annotation, restTemplate);
    }

    @Override
    public Boolean health() {
        final String url = String.format("%s/actuator/health", workflowUrl);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, null, Map.class);

        return response.getStatusCodeValue() == 200 && response.getBody().get("status").equals("UP");
    }

    protected boolean takeAction(String documentNumber, String actionType, String annotation, RestTemplate restTemplate) {
        Map<String, String> requestParameters = new HashMap<>();
        requestParameters.put("type", actionType);
        requestParameters.put("annotation", annotation);
        requestParameters.put("priority", "0");
        try {
            String url = String.format("%s/processInstances/%s/actions", workflowUrl, documentNumber.toString());
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(requestParameters), Map.class);
            return response.getStatusCode() == HttpStatus.CREATED;
        } catch (Exception ex) {
            logger.error(ex);
            throw new RuntimeException(ex);
        }
    }
}
