package edu.iu.es.ebs.rwa.service.impl;

import edu.iu.es.ebs.rwa.RwaConstants;
import edu.iu.es.ebs.rwa.domain.ArrangementDocument;
import edu.iu.es.ebs.rwa.domain.Job;
import edu.iu.es.ebs.rwa.domain.Person;
import edu.iu.es.ebs.rwa.repositories.ArrangementDocumentRepository;
import edu.iu.es.ebs.rwa.service.AuthorizationService;
import edu.iu.es.ebs.rwa.service.PersonService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collection;

@Service
public class AuthorizationServiceImpl implements AuthorizationService {
    protected static final String ROLE_PREFIX = "ROLE_";

    @Value("${feature.backdoor.enabled}")
    private Boolean backdoorEnabled;

    @Autowired
    protected org.springframework.core.env.Environment environment;

    @Autowired
    PersonService personService;

    @Autowired
    ArrangementDocumentRepository arrangementDocumentRepository;

    @Override
    public boolean isAdmin() {
        Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();

        return hasRole(RwaConstants.Roles.ADMIN, currentAuth.getAuthorities());
    }

    @Override
    public boolean isReviewer() {
        return hasRole(RwaConstants.Roles.RWA_REVIEWER, SecurityContextHolder.getContext().getAuthentication().getAuthorities());
    }

    @Override
    public boolean isBackdoorAllowed() {
        Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();

        boolean backdoorRole = hasRole(RwaConstants.Roles.BACKDOOR_USER, currentAuth.getAuthorities()) ||
                                hasRole(RwaConstants.Roles.PREVIOUS_ADMINISTRATOR, currentAuth.getAuthorities());

        return !isPrd() && backdoorEnabled && backdoorRole;
    }

    @Override
    public boolean isImpersonating() {
        Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();

        return hasRole(RwaConstants.Roles.IMPERSONATOR, currentAuth.getAuthorities());
    }

    @Override
    public boolean isPrd() {
        String[] activeProfiles = environment.getActiveProfiles();

        return Arrays.asList(activeProfiles).contains(RwaConstants.PRD_ENVIRONMENT_CODE);
    }

	@Override
    public boolean canCreateArrangement(Job job) {
        Person person = personService.getPersonByUniversityId(job.getEmplid());
        if(person == null) {
            throw new RuntimeException("Unable to get person information for " + job.getEmplid());
        }

        return StringUtils.equalsIgnoreCase(getCurrentNetworkId(), person.getNetworkId());
    }

    @Override
    public boolean canViewArrangement(String documentNumber) {
        ArrangementDocument doc = arrangementDocumentRepository.findById(documentNumber).orElse(null);
        if (doc == null) {
            throw new RuntimeException("Unable to find arrangement for document number " + documentNumber);
        }

        return canViewArrangement(doc);
    }

    @Override
    public boolean canViewArrangement(ArrangementDocument arrangementDocument) {
        String currentNetworkId = getCurrentNetworkId();
        boolean isInitiator = StringUtils.equals(currentNetworkId, arrangementDocument.getCreateUserId());
        boolean isSupervisor = StringUtils.equals(currentNetworkId, arrangementDocument.getSupervisorReviewerId());
        boolean isHrReviewer = StringUtils.equals(currentNetworkId, arrangementDocument.getHrReviewerId());
        boolean isAdHocReviewer = arrangementDocument.getArrangementAdHocs().stream().anyMatch(adhoc ->
            StringUtils.equals(currentNetworkId, adhoc.getNetworkId()));

        return isInitiator || isSupervisor || isHrReviewer || isAdHocReviewer || isAdmin();
    }

    protected boolean hasRole(String roleName, Collection<? extends GrantedAuthority> authorities) {
        for (GrantedAuthority grantedAuthority: authorities) {
            if (StringUtils.equals(ROLE_PREFIX + roleName, grantedAuthority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    protected String getCurrentNetworkId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

}
