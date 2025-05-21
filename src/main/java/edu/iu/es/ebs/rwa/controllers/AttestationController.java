package edu.iu.es.ebs.rwa.controllers;

import edu.iu.es.ebs.rwa.domain.AttestationText;
import edu.iu.es.ebs.rwa.service.AttestationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/attestation")
public class AttestationController {

    @Autowired
    AttestationService attestationService;

    @RequestMapping("")
    public Map<String, Object> getAttestations() {
        Map<String, Object> response = new HashMap<>();

        response.put("currentAttestation", attestationService.getCurrentAttestation());
        response.put("futureAttestations", attestationService.getFutureAttestations());

        return response;
    }

    @RequestMapping(value = "", method = RequestMethod.POST)
    public Map<String, Object> saveAttestation(@RequestBody AttestationText attestationText) {
        Map<String, Object> response = new HashMap<>();

        List<String> errors = attestationService.saveAttestation(attestationText);
        response.put("errors", errors);

        return response;
    }

}
