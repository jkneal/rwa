package edu.iu.es.ebs.rwa.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.type.YesNoConverter;

import java.time.LocalTime;

@Entity
@Table(name = "arrangement_work_days_t")
@Getter
@Setter
@NoArgsConstructor
public class ArrangementWorkDays {

    @Id
    @Column(name = "fdoc_nbr")
    private String documentNumber;

    @Column(name = "work_days_typ")
    private String workDaysType;

    @Column(name = "float_num_of_days")
    private Integer floatingNumberOfDays;

    @Column(name = "fixed_monday")
    @Convert(converter = YesNoConverter.class)
    private boolean fixedMonday;

    @Column(name = "fixed_tuesday")
    @Convert(converter = YesNoConverter.class)
    private boolean fixedTuesday;

    @Column(name = "fixed_wednesday")
    @Convert(converter = YesNoConverter.class)
    private boolean fixedWednesday;

    @Column(name = "fixed_thursday")
    @Convert(converter = YesNoConverter.class)
    private boolean fixedThursday;

    @Column(name = "fixed_friday")
    @Convert(converter = YesNoConverter.class)
    private boolean fixedFriday;

    @Column(name = "fixed_saturday")
    @Convert(converter = YesNoConverter.class)
    private boolean fixedSaturday;

    @Column(name = "fixed_sunday")
    @Convert(converter = YesNoConverter.class)
    private boolean fixedSunday;

    @JsonFormat(pattern = "HH:mm:ss")
    @Column(name = "core_hrs_start_tm")
    private LocalTime coreHoursStartTime;

    @JsonFormat(pattern = "HH:mm:ss")
    @Column(name = "core_hrs_end_tm")
    private LocalTime coreHoursEndTime;

    @JsonFormat(pattern = "hh:mm a")
    @Transient
    public LocalTime getFormattedCoreHoursStartTime() {
        return coreHoursStartTime;
    }

    @JsonFormat(pattern = "hh:mm a")
    @Transient
    public LocalTime getFormattedCoreHoursEndTime() {
        return coreHoursEndTime;
    }
}
