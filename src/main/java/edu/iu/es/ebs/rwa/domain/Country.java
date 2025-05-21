package edu.iu.es.ebs.rwa.domain;

import lombok.Getter;
import lombok.Setter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(schema = "rwa", name = "country_t")
@Getter
@Setter
public class Country {
    @Id
    @Column(name="postal_country_code")
    private String postalCountryCode;

    @Column(name="postal_country_name")
    private String postalCountryName;
}
