package edu.iu.es.ebs.rwa.domain;

import lombok.Getter;
import lombok.Setter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(schema = "rwa", name = "postal_code_t")
@Getter
@Setter
public class PostalCode {
    @Id
    @Column(name="postal_code")
    private String postalCode;

    @Column(name="postal_state_code")
    private String postalStateCode;
}
