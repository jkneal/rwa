package edu.iu.es.ebs.rwa.domain;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class WorkflowAction {

    private String id;

    private String principalName;

    private String annotation;

    private String type;

    private LocalDateTime created;

    @JsonFormat(pattern = "MM/dd/yyyy hh:mm a")
    public LocalDateTime getFormattedCreateTime() {
        return created;
    }

}
