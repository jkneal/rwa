package edu.iu.es.ebs.rwa.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Transient;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Job implements Serializable {

    @Column(name = "emplid")
    private String emplid;

    @Column(name = "job_rcd_nbr")
    private int jobRecordNumber;

    @Column(name = "job_position_nbr")
    private String jobPositionNumber;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "job_department_id")
    private String jobDepartmentId;

    @Column(name = "job_effdt")
    private LocalDate jobEffectiveDate;

    @Column(name = "job_paygroup")
    private String payGroupCode;

    @Transient
    private String jobFullPartTimeIndicator;

    @Transient
    private String reportsToUniversityId;

    @Transient
    public void setRecordNumber(int recordNumber) {
        this.jobRecordNumber = recordNumber;
    }

    @Transient
    public void setPositionNumber(String positionNumber) {
        this.jobPositionNumber = positionNumber;
    }

    @Transient
    public void setEffectiveDate(LocalDate effectiveDate) {
        this.jobEffectiveDate = effectiveDate;
    }

    @Transient
    public void setPositionDescription(String positionDescription) {
        this.jobTitle = positionDescription;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Job job = (Job) o;
        return jobRecordNumber == job.jobRecordNumber &&
            Objects.equals(emplid, job.emplid) &&
            Objects.equals(jobPositionNumber, job.jobPositionNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(emplid, jobRecordNumber, jobPositionNumber);
    }
}
