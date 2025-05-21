package edu.iu.es.ebs.rwa.controllers;

import edu.iu.es.ebs.rwa.domain.AdminArrangementDto;
import edu.iu.es.ebs.rwa.service.ArrangementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    ArrangementService arrangementService;

    @RequestMapping(value = "/arrangements/search", method = RequestMethod.POST)
    public List<AdminArrangementDto> searchArrangements(@RequestBody Map<String, Object> searchParameters) {
        return arrangementService.getArrangements(searchParameters);
    }
}
