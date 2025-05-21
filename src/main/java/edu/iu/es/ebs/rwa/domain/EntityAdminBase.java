package edu.iu.es.ebs.rwa.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.LocalDateTime;

@MappedSuperclass
@Getter
@Setter
public class EntityAdminBase {

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "MM/dd/yyyy hh:mm a")
    @Column(name = "LAST_UPDT_TS")
    protected LocalDateTime lastUpdatedTimestamp;

    @Column(name = "LAST_UPDT_USER_ID")
    protected String lastUpdatedUserId;

    @PrePersist
    @PreUpdate
    public void prePersist() {
        lastUpdatedTimestamp = LocalDateTime.now();

        if (SecurityContextHolder.getContext() != null &&
            SecurityContextHolder.getContext().getAuthentication() != null) {
            Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
            lastUpdatedUserId = currentAuth.getName();
        } else {
            lastUpdatedUserId = "system";
        }
    }
}
