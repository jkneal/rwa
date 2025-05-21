package edu.iu.es.ebs.rwa.service;

import edu.iu.es.ebs.rwa.domain.Organization;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@TestPropertySource(value = "classpath:/launchpad-base-config.properties")
class OrganizationServiceIT {

    @Autowired
    OrganizationService organizationService;

    @Test
    void getOrganizations() {
        List<Organization> organizations = organizationService.getOrganizations();
        assertTrue(organizations.size() > 0);

        Organization organization = organizations.get(0);
        assertNotNull(organization.getCode());
        assertNotNull(organization.getName());
        assertNotNull(organization.getChartCode());
    }
}