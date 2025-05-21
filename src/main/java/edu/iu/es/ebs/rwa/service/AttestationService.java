package edu.iu.es.ebs.rwa.service;

import edu.iu.es.ebs.rwa.domain.AttestationText;

import java.util.List;

public interface AttestationService {

    AttestationText getCurrentAttestation();

    List<AttestationText> getFutureAttestations();

    List<String> saveAttestation(AttestationText attestationText);
}
