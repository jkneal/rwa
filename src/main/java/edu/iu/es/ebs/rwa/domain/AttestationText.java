package edu.iu.es.ebs.rwa.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "attestation_text_t")
@Getter
@Setter
@NoArgsConstructor
public class AttestationText extends EntityAdminBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "text")
    private String text;

    @JsonFormat(pattern = "MM/dd/yyyy")
    @Column(name = "effdt")
    private LocalDate effectiveDate;
}
