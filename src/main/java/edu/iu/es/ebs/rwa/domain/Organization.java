package edu.iu.es.ebs.rwa.domain;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class Organization implements Serializable {
    private String chartCode;
    private String code;
    private String name;
    private String responsibilityCenter;
    private String responsibilityCenterName;
}
