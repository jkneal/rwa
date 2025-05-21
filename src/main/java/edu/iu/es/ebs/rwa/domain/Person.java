package edu.iu.es.ebs.rwa.domain;

import edu.iu.es.ebs.rwa.configuration.SpringContext;
import edu.iu.es.ebs.rwa.service.AuthorizationService;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
/*
  When making changes to this class an exception like so will start occurring:
  Cannot deserialize; nested exception is org.springframework.core.serializer.support.SerializationFailedException: Failed to deserialize payload. Is the byte array a result of corresponding serialization for DefaultDeserializer?; nested exception is java.io.InvalidClassException: edu.iu.es.ebs.rwa.domain.Person; local class incompatible:
  1. Set IntelliJ Environment Variable spring.redis.cache.prefix=dev-<your username>-1 to avoid it during local development
  2. Set on your jiras' technical release notes to increment spring.redis.cache.prefix in vault prior to the release
 */
public class Person implements Serializable {

    private String networkId;

    private String universityId;

    private String analyticsId;

    private String firstName;

    private String lastName;

    private String emailAddress;

    private String campusPhoneNumber;

    private String campus;

    private String departmentCode;

    private String departmentDesc;

    private boolean student;

    private boolean employee;

    private boolean affiliate;

    private List<Job> jobs;

    private List<Contact> contacts;

    public void setUsername(String username) {
        this.networkId = username;
    }

    public boolean isAdmin() {
        return SpringContext.getBean(AuthorizationService.class).isAdmin();
    }

    public boolean isReviewer() {
        return SpringContext.getBean(AuthorizationService.class).isReviewer();
    }

    public boolean isBackdoorAllowed() {
        return SpringContext.getBean(AuthorizationService.class).isBackdoorAllowed();
    }

    public boolean isImpersonating() {
        return SpringContext.getBean(AuthorizationService.class).isImpersonating();
    }

    public String getPreferredName() {
        return lastName + ", " + firstName;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Contact implements Serializable {
        private String phoneNumber;
    }
}
