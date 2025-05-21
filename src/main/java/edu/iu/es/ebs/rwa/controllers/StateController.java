package edu.iu.es.ebs.rwa.controllers;

import edu.iu.es.ebs.rwa.domain.State;
import edu.iu.es.ebs.rwa.repositories.StateRepository;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/states")
public class StateController {

    @Autowired
    private StateRepository stateRepository;

    @GetMapping("/")
    public List<State> getStates() {
        return stateRepository.findAll();
    }

}
