package edu.iu.es.ebs.rwa.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import jakarta.persistence.Transient;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class ArrangementStatus {

    private String documentNumber;
    private Job job;
    private LocalDate remoteWorkStartDate;
    private LocalDate remoteWorkEndDate;
    private String remoteWorkType;
    private LocalDateTime createTimestamp;
    private LocalDateTime completedTimestamp;
    private String status;
    private String disapproveReason;

    public ArrangementStatus() {

    }

    public ArrangementStatus(ArrangementDocument document) {
        this.documentNumber = document.getDocumentNumber();
        this.job = document.getJob();
        this.remoteWorkType = document.getRemoteWorkType();
        this.remoteWorkStartDate = document.getRemoteWorkStartDate();
        this.remoteWorkEndDate = document.getRemoteWorkEndDate();
        this.createTimestamp = document.getCreateTimestamp();
        this.completedTimestamp = document.getCompletedTimestamp();
        this.status = document.getStatus();
        this.disapproveReason = document.getDisapproveReason();
    }

    @JsonFormat(pattern = "MM/dd/yyyy")
    @Transient
    public LocalDateTime getFormattedCreateTimestamp() {
        return createTimestamp;
    }

    @JsonFormat(pattern = "MM/dd/yyyy")
    @Transient
    public LocalDateTime getFormattedCompletedTimestamp() {
        return completedTimestamp;
    }
}
