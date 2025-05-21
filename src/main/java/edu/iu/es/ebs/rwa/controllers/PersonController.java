package edu.iu.es.ebs.rwa.controllers;

import edu.iu.es.ebs.rwa.domain.PersonSearchData;
import edu.iu.es.ebs.rwa.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/person")
public class PersonController {

    @Autowired
    private PersonService personService;

    @RequestMapping(value="/{displayName}", method= RequestMethod.GET)
    public List<PersonSearchData> searchByDisplayName(@PathVariable("displayName") String criteria) {
        return personService.searchPersons(criteria, 15);
    }

}
