package edu.iu.es.ebs.rwa.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.type.YesNoConverter;

import java.time.LocalDateTime;

@Entity
@Table(name = "arrangement_adhoc_t")
@Getter
@Setter
@NoArgsConstructor
public class ArrangementAdHoc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "fdoc_nbr")
    private String documentNumber;

    @Column(name = "requester_id")
    private String requesterId;

    @Column(name = "network_id")
    private String networkId;

    @Column(name = "comments")
    private String comments;

    @Column(name = "pushback")
    @Convert(converter = YesNoConverter.class)
    private boolean pushback;

    @Column(name = "create_ts")
    private LocalDateTime createTimestamp;

    @JsonIgnore
    @ManyToOne(fetch= FetchType.LAZY)
    @JoinColumn(name="FDOC_NBR", referencedColumnName="FDOC_NBR", insertable = false, updatable = false)
    private ArrangementDocument arrangementDocument;

    public ArrangementAdHoc(String documentNumber, String requesterId, String networkId, String comments) {
        this.documentNumber = documentNumber;
        this.networkId = networkId;
        this.requesterId = requesterId;
        this.comments = comments;
        this.createTimestamp = LocalDateTime.now();
    }
}
