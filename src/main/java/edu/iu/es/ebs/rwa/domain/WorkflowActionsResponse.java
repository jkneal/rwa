package edu.iu.es.ebs.rwa.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class WorkflowActionsResponse {

    private Embedded _embedded;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Embedded {
        private List<WorkflowAction> actions;
    }
}
