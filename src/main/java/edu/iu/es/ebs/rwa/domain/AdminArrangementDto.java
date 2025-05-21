package edu.iu.es.ebs.rwa.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class AdminArrangementDto {

    private String name;
    private String employeeId;
    private int jobRecordNumber;
    private String jobPositionNumber;
    private String responsibilityCenter;
    private String responsibilityCenterName;
    private String jobDepartmentChart;
    private String jobDepartmentOrg;
    private String rwaDocumentNumber;
    private String rwaRouteLogDocumentNumber;
    private String remoteWorkType;
    @JsonFormat(pattern = "MM/dd/yyyy")
    private LocalDate remoteWorkStartDate;
    @JsonFormat(pattern = "MM/dd/yyyy")
    private LocalDate remoteWorkEndDate;
    private String status;
    private String supervisor;
    private boolean completed;
    private String currentSupervisor;
    private String currentSupervisorId;
}
