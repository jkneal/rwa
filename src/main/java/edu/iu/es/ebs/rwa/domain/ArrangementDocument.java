package edu.iu.es.ebs.rwa.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import edu.iu.es.ebs.rwa.configuration.SpringContext;
import edu.iu.es.ebs.rwa.service.PersonService;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hibernate.type.YesNoConverter;
import org.springframework.beans.factory.annotation.Configurable;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.chrono.ChronoLocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configurable
@Entity
@Table(name = "arrangement_doc_t")
@Getter
@Setter
public class ArrangementDocument {

    @Transient
    private static final Log LOG = LogFactory.getLog(ArrangementDocument.class);

    @Id
    @Column(name = "fdoc_nbr")
    private String documentNumber;

    @Embedded
    private Job job;

    @Column(name = "empl_first_nm")
    private String employeeFirstName;

    @Column(name = "empl_last_nm")
    private String employeeLastName;

    @JsonFormat(pattern = "MM/dd/yyyy")
    @Column(name = "remote_work_start_dt")
    private LocalDate remoteWorkStartDate;

    @JsonFormat(pattern = "MM/dd/yyyy")
    @Column(name = "remote_work_end_dt")
    private LocalDate remoteWorkEndDate;

    @Column(name = "ended_due_to_supervisor_change")
    @Convert(converter = YesNoConverter.class)
    private boolean endedDueToSupervisorChange;

    @Column(name = "distance_iu_campus")
    @Convert(converter = YesNoConverter.class)
    private Boolean distanceIuCampus;

    @Column(name = "work_addr_home")
    @Convert(converter = YesNoConverter.class)
    private boolean workAddressHome;

    @Column(name = "work_addr_ln1")
    private String workAddressLine1;

    @Column(name = "work_addr_ln2")
    private String workAddressLine2;

    @Column(name = "work_addr_city")
    private String workAddressCity;

    @Column(name = "work_addr_st")
    private String workAddressState;

    @Column(name = "work_addr_cntry")
    private String workAddressCountry;

    @Column(name = "work_addr_zip")
    private String workAddressZip;

    @Column(name = "remote_work_typ")
    private String remoteWorkType;

    @Column(name = "reason")
    private String reason;

    @Column(name = "student_facing_percentage")
    private Integer studentFacingPercentage;

    @Column(name = "spvsr_reviewer_id")
    private String supervisorReviewerId;

    @Column(name = "hr_reviewer_id")
    private String hrReviewerId;

    @Column(name = "create_ts")
    private LocalDateTime createTimestamp;

    @Column(name = "create_user_id")
    private String createUserId;

    @Column(name = "completed_ts")
    private LocalDateTime completedTimestamp;

    @Column(name = "status")
    private String status;

    @Column(name = "disapprove_reason")
    private String disapproveReason;

    @Column(name = "attestation_ack")
    @Convert(converter = YesNoConverter.class)
    private boolean attestationAcknowledged;

    @Column(name = "last_updt_ts")
    private LocalDateTime lastUpdateTimetamp;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name="fdoc_nbr", referencedColumnName="fdoc_nbr", insertable = false, updatable = false)
    private ArrangementWorkDays arrangementWorkDays;

    @ManyToOne
    @JoinColumn(name="attestation_id", referencedColumnName="id")
    private AttestationText attestationText;

    @OneToMany(mappedBy = "arrangementDocument", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ArrangementAdHoc> arrangementAdHocs;

    @ManyToOne(cascade = CascadeType.REFRESH)
    @JoinColumn(name="work_addr_cntry", referencedColumnName="postal_country_code", insertable = false, updatable = false)
    private Country workCountry;

    @ManyToOne(cascade = CascadeType.REFRESH)
    @JoinColumn(name="work_addr_st", referencedColumnName="postal_state_code", insertable = false, updatable = false)
    private State workState;

    @Transient
    private WorkflowDocument workflowDocument;

    @Transient
    private String additionalReviewerId;

    @Transient
    private String comments;

    @Transient
    @JsonIgnore
    private PersonService personService;

    public ArrangementDocument() {
        arrangementWorkDays = new ArrangementWorkDays();
    }

    @Transient
    public Person getEmployee() {
        if (job != null && StringUtils.isNotBlank(job.getEmplid())) {
            if (personService == null) {
                personService = SpringContext.getBean(PersonService.class);
            }
            return personService.getPersonByUniversityId(job.getEmplid());
        }

        return null;
    }

    @Transient
    public Map<String, String> getSupervisor() {
        Map<String, String> ret = new HashMap<>();
        try {
            ret = getPersonName(supervisorReviewerId);
        } catch (Exception e) {
            LOG.info("Could not find person for supervisorReviewerId " + supervisorReviewerId, e);
        }
        return ret;
    }

    @Transient
    public Map<String, String> getHrReviewer() {
        Map<String, String> ret = new HashMap<>();
        try {
            ret = getPersonName(hrReviewerId);
        } catch (Exception e) {
            LOG.info("Could not find person for hrReviewerId " + hrReviewerId, e);
        }
        return ret;
    }

    protected Map<String, String> getPersonName(String networkId) {
        Map<String, String> personInfo = null;

        if (!StringUtils.isBlank(networkId)) {
            if (personService == null) {
                personService = SpringContext.getBean(PersonService.class);
            }
            Person person = personService.getPersonByNetworkId(networkId);
            if(person == null) {
                throw new RuntimeException("Unable to get person information for " + networkId);
            }
            personInfo = new HashMap<>();
            personInfo.put("networkId", person.getNetworkId());
            personInfo.put("firstName", person.getFirstName());
            personInfo.put("lastName", person.getLastName());
        }

        return personInfo;
    }

    @Transient
    public boolean isExpired() {
        return getRemoteWorkEndDate() != null && LocalDate.now().isAfter(ChronoLocalDate.from(getRemoteWorkEndDate()));
    }

    @Transient
    public String getFormattedWorkAddressHome() {
        return this.isWorkAddressHome() ? "YES" : "NO";
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

    @JsonFormat(pattern = "MM/dd/yyyy hh:mm")
    @Transient
    public LocalDateTime getFormattedLastUpdatedTimestamp() {
        return lastUpdateTimetamp;
    }
}
