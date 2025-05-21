package edu.iu.es.ebs.rwa.service.impl;

import edu.iu.es.ebs.rwa.RwaConstants;
import edu.iu.es.ebs.rwa.domain.Job;
import edu.iu.es.ebs.rwa.domain.Person;
import edu.iu.es.ebs.rwa.domain.PersonSearchData;
import edu.iu.es.ebs.rwa.service.PersonService;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.PartialResultException;
import javax.naming.directory.*;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PersonServiceImpl implements PersonService {
    protected final Log log = LogFactory.getLog(this.getClass());

    private static final String adsURL = "ldap://ads.iu.edu";

    @Value("${ads.username}")
    private String adsUsername;

    @Value("${ads.password}")
    private String adsPassword;

    @Value("${ims.url}")
    private String imsUrl;

    @Autowired
    @Qualifier("clientCredentialRestTemplate")
    private RestTemplate restTemplate;

    @Autowired
    protected org.springframework.core.env.Environment environment;

    private DirContext dirContext;
    private LocalDateTime lastRefreshed = LocalDateTime.MIN;

    @Override
    @Cacheable(Cache.GET_PERSON_WITH_JOBS)
    public Person getPersonWithJobsByNetworkId(String networkId) {
        if (StringUtils.equals(networkId, RwaConstants.AFT_USER) && !isPrd()) {
            Person aftUser = new Person();
            aftUser.setNetworkId(RwaConstants.AFT_USER);
            aftUser.setFirstName("RWA");
            aftUser.setLastName("AFT");

            return aftUser;
        }

        try {
            ResponseEntity<Person> response = restTemplate.getForEntity(imsUrl + "/search?username=" + networkId,
                Person.class);

            if (!response.getStatusCode().equals(HttpStatus.OK)) {
                throw new RuntimeException("Unable to get IMS profile for " + networkId + ": "
                    + response.getStatusCode().toString());
            }

            Person person = response.getBody();

            for (Job job : person.getJobs()) {
                job.setEmplid(person.getUniversityId());
            }

            if (person.getContacts() != null && !person.getContacts().isEmpty()) {
                person.setCampusPhoneNumber(person.getContacts().get(0).getPhoneNumber());
            }

            return person;
        } catch (Exception e) {
            log.error("Unable to get person information for " + networkId, e);
            return null;
        }
    }
    @Override
    @Cacheable(Cache.GET_PERSON)
    public Person getPersonByNetworkId(String networkId) {
        if (StringUtils.equals(networkId, RwaConstants.AFT_USER) && !isPrd()) {
            Person aftUser = new Person();
            aftUser.setNetworkId(RwaConstants.AFT_USER);
            aftUser.setFirstName("RWA");
            aftUser.setLastName("AFT");

            return aftUser;
        }

        try {
            ResponseEntity<Person> response = restTemplate.getForEntity(imsUrl + "/profile/" + networkId,
                Person.class);

            if (!response.getStatusCode().equals(HttpStatus.OK)) {
                throw new RuntimeException("Unable to get IMS profile for " + networkId + ": "
                    + response.getStatusCode().toString());
            }

            Person person = response.getBody();

            if (person.getContacts() != null && !person.getContacts().isEmpty()) {
                person.setCampusPhoneNumber(person.getContacts().get(0).getPhoneNumber());
            }

            return person;
        } catch (Exception e) {
            log.error("Unable to retrieve IMS data for " + networkId, e);
            return null;
        }
    }

    @Override
    @Cacheable(Cache.GET_PERSON_BY_EMPLID)
    public Person getPersonByUniversityId(String universityId) {
        try {
            ResponseEntity<Person> response = restTemplate.getForEntity(imsUrl + "/search?universityId=" + universityId,
                Person.class);

            if (!response.getStatusCode().equals(HttpStatus.OK)) {
                throw new RuntimeException("Unable to get IMS profile for " + universityId + ": "
                    + response.getStatusCode().toString());
            }

            Person person = response.getBody();

            for (Job job: person.getJobs()) {
                job.setEmplid(person.getUniversityId());
            }

            if (person.getContacts() != null && !person.getContacts().isEmpty()) {
                person.setCampusPhoneNumber(person.getContacts().get(0).getPhoneNumber());
            }

            return person;
        } catch (Exception e) {
            log.error("Unable to get person information for " + universityId, e);
            return null;
        }

    }

    @Override
    public List<PersonSearchData> searchPersons(String displayName, int searchResultLimit) {
        DirContext ctx = getContext();
        ArrayList adsPersons = new ArrayList();
        String[] attributesToGet = new String[]{RwaConstants.TITLE, RwaConstants.MAIL, RwaConstants.DISPLAY_NAME, RwaConstants.SAM_ACCOUNT_NAME};
        SearchControls ctls = new SearchControls();
        ctls.setSearchScope(SearchControls.ONELEVEL_SCOPE);
        ctls.setReturningAttributes(attributesToGet);
        ctls.setCountLimit(searchResultLimit);
        ctls.setTimeLimit(1000);
        String escapedName = escapeLDAPSearchFilter(displayName);
        String escapedNameWithComma = StringUtils.replace(escapedName, " ", ", ");
        String filter = String.format("(&(objectClass=user)(!(" + RwaConstants.TITLE + "=group))(|(" + RwaConstants.DISPLAY_NAME + "=%s*)(" + RwaConstants.DISPLAY_NAME + "=%s*)("
                + RwaConstants.SAM_ACCOUNT_NAME + "=%s*)))",
            escapedName, escapedNameWithComma, escapedName);
        try {
            NamingEnumeration answer = ctx.search("ou=Accounts,dc=ads,dc=iu,dc=edu", filter, ctls);
            while (adsPersons.size() < searchResultLimit && answer.hasMore()) {
                Attributes userAttributes = ((SearchResult)answer.next()).getAttributes();
                if (userAttributes == null || userAttributes.get(RwaConstants.DISPLAY_NAME) == null ||
                        userAttributes.get(RwaConstants.SAM_ACCOUNT_NAME) == null) {
                    continue;
                }
                PersonSearchData tempPerson = new PersonSearchData();
                tempPerson.setName((String) userAttributes.get(RwaConstants.DISPLAY_NAME).get());
                tempPerson.setEmail((userAttributes.get(RwaConstants.MAIL) == null ?
                    "" : (String) userAttributes.get(RwaConstants.MAIL).get()));
                tempPerson.setNetworkId((String) userAttributes.get(RwaConstants.SAM_ACCOUNT_NAME).get());
                adsPersons.add(tempPerson);
            }
        } catch (PartialResultException e) {
            // Ignore
        } catch (NamingException e) {
            log.error("Exception looking up partial name.", e);
            return adsPersons;
        }
        return adsPersons;
    }

    public boolean isPrd() {
        String[] activeProfiles = environment.getActiveProfiles();

        return Arrays.asList(activeProfiles).contains(RwaConstants.PRD_ENVIRONMENT_CODE);
    }

    private DirContext getContext() {
        if (dirContext != null) {
            Duration age = Duration.between(lastRefreshed, LocalDateTime.now());
            if (age.compareTo(Duration.ofMinutes(5)) < 0) {
                return dirContext;
            }
        }
        Hashtable<String, String> env = new Hashtable();
        env.put("java.naming.factory.initial", "com.sun.jndi.ldap.LdapCtxFactory");
        env.put("com.sun.jndi.ldap.connect.timeout", "5000");
        env.put("java.naming.provider.url", adsURL);
        env.put("java.naming.security.authentication", "simple");
        env.put("java.naming.security.principal", "cn=" + adsUsername + ",ou=Accounts,dc=" + "ads" + ",dc=iu,dc=edu");
        env.put("java.naming.security.credentials", adsPassword);
        env.put("java.naming.security.protocol", "ssl");
        env.put("java.naming.referral", "follow");
        env.put("com.sun.jndi.ldap.connect.pool", "true");
        try {
            dirContext = new InitialDirContext(env);
        } catch (NamingException e) {
            throw new RuntimeException("Error getting ADS DirContext.", e);
        }
        lastRefreshed = LocalDateTime.now();
        return dirContext;
    }

    private String escapeLDAPSearchFilter(String filter) {
        StringBuilder stringBuilder = new StringBuilder();
        for(int i = 0; i < filter.length(); ++i) {
            char curChar = filter.charAt(i);
            switch(curChar) {
                case '\u0000':
                    stringBuilder.append("\\00");
                    break;
                case '(':
                    stringBuilder.append("\\28");
                    break;
                case ')':
                    stringBuilder.append("\\29");
                    break;
                case '*':
                    stringBuilder.append("\\2a");
                    break;
                case '\\':
                    stringBuilder.append("\\5c");
                    break;
                default:
                    stringBuilder.append(curChar);
            }
        }
        return stringBuilder.toString();
    }

    public final class Cache {

        public static final String GET_PERSON = "get-person";
        public static final String GET_PERSON_WITH_JOBS = "get-person-with-jobs";
        public static final String GET_PERSON_BY_EMPLID = "get-person-by-emplid";

        private Cache() {}
    }


}
