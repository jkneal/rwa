package edu.iu.es.ebs.rwa.service.impl;

import edu.iu.es.ebs.rwa.domain.Organization;
import edu.iu.es.ebs.rwa.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Objects;

@Service("organizationService")
public class OrganizationServiceImpl implements OrganizationService {
    @Value("${coai.url}")
    private String coaiUrl;

    @Autowired
    @Qualifier("clientCredentialRestTemplate")
    private RestTemplate restTemplate;

    @Override
    @Cacheable("organizations")
    public List<Organization> getOrganizations() {
        ResponseEntity<List<Organization>> orgResponse = restTemplate
                .exchange(coaiUrl +"/api/coa/organizations", HttpMethod.GET, null, new ParameterizedTypeReference<>() {});

        return Objects.requireNonNull(orgResponse.getBody());
    }

    public final class Cache {

        public static final String ORGANIZATIONS = "organizations";

        private Cache() {}
    }
}
