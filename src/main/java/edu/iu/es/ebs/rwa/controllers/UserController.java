package edu.iu.es.ebs.rwa.controllers;

import edu.iu.es.ebs.rwa.domain.ArrangementDocument;
import edu.iu.es.ebs.rwa.domain.JobArrangementStatus;
import edu.iu.es.ebs.rwa.domain.Person;
import edu.iu.es.ebs.rwa.exceptions.AuthorizationException;
import edu.iu.es.ebs.rwa.service.ArrangementService;
import edu.iu.es.ebs.rwa.service.AuthorizationService;
import edu.iu.es.ebs.rwa.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    PersonService personService;

    @Autowired
    ArrangementService arrangementService;

    @Autowired
    private AuthorizationService authorizationService;

    @RequestMapping()
    public Person getUserInfo() {
        Person person = personService.getPersonByNetworkId(getCurrentNetworkId());
        if(person == null) {
            throw new RuntimeException("Unable to get person information for " + getCurrentNetworkId());
        }
        return person;
    }

    @RequestMapping("/rwas/status")
    public List<JobArrangementStatus> getUserWorkArrangementStatus() {
        return arrangementService.getJobArrangementStatuses(getCurrentNetworkId());
    }

    @RequestMapping(value={"/oldRwas", "/oldRwas/"})
    public List<ArrangementDocument> getUserOldArrangements() {
        return arrangementService.getOldArrangements(getCurrentNetworkId());
    }

    @GetMapping("/backdoor/{networkId}")
    public String backdoor(@PathVariable("networkId") String networkId) {
        boolean canBackdoor = authorizationService.isBackdoorAllowed();
        if (!canBackdoor) {
            throw new AuthorizationException("Backdoor is not allowed");
        }

        return networkId;
    }

    protected String getCurrentNetworkId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

}
