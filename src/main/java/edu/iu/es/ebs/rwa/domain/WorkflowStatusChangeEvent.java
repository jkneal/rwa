package edu.iu.es.ebs.rwa.domain;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

/**
 * This class is maintained by Enterprise Platforms
 */
@Data
@AllArgsConstructor
@Builder
public class WorkflowStatusChangeEvent {

    private String processInstanceId;
    private String referenceId;
    private ProcessInstanceStatus oldStatus;
    private ProcessInstanceStatus newStatus;

    public enum ProcessInstanceStatus {
        PREROUTE("P"),
        ENROUTE("R"),
        COMPLETED("C"),
        ABORTED("A"),
        SUSPENDED("S");

        private final String code;

        ProcessInstanceStatus(String code) {
            this.code = code;
        }

        @JsonValue
        public String getCode() {
            return code;
        }

    }

}
