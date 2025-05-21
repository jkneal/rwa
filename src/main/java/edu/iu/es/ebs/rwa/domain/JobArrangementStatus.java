package edu.iu.es.ebs.rwa.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class JobArrangementStatus {

    private Job job;

    private ArrangementStatus completedDocument;

    private ArrangementStatus pendingOrDisapprovedDocument;

    private List<ArrangementStatus> previousDocuments;

    public JobArrangementStatus(Job job) {
        this.job = job;
    }

}
