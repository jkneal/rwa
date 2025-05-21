package edu.iu.es.ebs.rwa.controllers;

import edu.iu.es.ebs.rwa.domain.Organization;
import edu.iu.es.ebs.rwa.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    @Autowired
    private OrganizationService organizationService;

    @RequestMapping(value="/", method= RequestMethod.GET)
    public List<Organization> getOrganizations() {
        return organizationService.getOrganizations();
    }
}
