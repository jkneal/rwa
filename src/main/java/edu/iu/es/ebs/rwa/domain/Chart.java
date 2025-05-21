package edu.iu.es.ebs.rwa.domain;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class Chart implements Serializable {
    private String code;
    private String description;
}
