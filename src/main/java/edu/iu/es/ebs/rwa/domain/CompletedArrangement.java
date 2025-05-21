package edu.iu.es.ebs.rwa.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@IdClass(CompletedArrangement.CompletedArrangementId.class)
@Table(name = "completed_arrangement_t")
@Getter
@Setter
@NoArgsConstructor
public class CompletedArrangement {

    @Id
    @Column(name = "emplid")
    private String emplid;

    @Id
    @Column(name = "job_rcd_nbr")
    private int jobRecordNumber;

    @Id
    @Column(name = "job_position_nbr")
    private String jobPositionNumber;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "job_effdt")
    private LocalDate jobEffectiveDate;

    @Column(name = "completed_ts")
    private LocalDateTime completedTimetamp;

    @Column(name = "last_updt_ts")
    private LocalDateTime lastUpdateTimetamp;

    @Column(name = "last_updt_doc_nbr")
    private String lastUpdateDocumentNumber;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompletedArrangementId implements Serializable {
        public String emplid;
        public int jobRecordNumber;
        public String jobPositionNumber;
    }

    public CompletedArrangement(Job job) {
        this.emplid = job.getEmplid();
        this.jobRecordNumber = job.getJobRecordNumber();
        this.jobPositionNumber = job.getJobPositionNumber();
        this.jobTitle = job.getJobTitle();
        this.jobEffectiveDate = job.getJobEffectiveDate();
    }
}
