package edu.iu.es.ebs.rwa.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class WorkflowDocument {

    public final static String STATUS_PREROUTE = "P";
    public final static String STATUS_ENROUTE = "R";
    public final static String STATUS_COMPLETED = "C";
    public final static String STATUS_ABORTED = "A";
    public final static String STATUS_SUSPENDED = "S";

    private String id;

    private String status;

    private String displayStatus;

    private String title;

    private Map<String, Object> _links;

    public boolean isCanCancel() {
        return _links != null && _links.containsKey("actions.cancel");
    }

    public boolean isCanComplete() {
        return _links != null && _links.containsKey("actions.complete");
    }

    public boolean isCanAcknowledge() {
        return _links != null && _links.containsKey("actions.acknowledge");
    }

    public boolean isCanApprove() {
        return _links != null && _links.containsKey("actions.approve");
    }

    public boolean isCanDisapprove() {
        return _links != null && _links.containsKey("actions.disapprove");
    }

    public boolean isCompleted() {
        return STATUS_COMPLETED.equals(status);
    }

    public boolean isInProcess() {
        return STATUS_ENROUTE.equals(status);
    }

    public boolean isDisapproved() {
        return STATUS_ABORTED.equals(status);
    }
}
