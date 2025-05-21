package edu.iu.es.ebs.rwa.service;

import edu.iu.es.ebs.rwa.domain.Person;
import edu.iu.es.ebs.rwa.domain.PersonSearchData;

import java.util.List;

public interface PersonService {

    Person getPersonWithJobsByNetworkId(String networkId);

    Person getPersonByNetworkId(String networkId);

    Person getPersonByUniversityId(String universityId);

    List<PersonSearchData> searchPersons(String displayName, int searchResultLimit);

}
