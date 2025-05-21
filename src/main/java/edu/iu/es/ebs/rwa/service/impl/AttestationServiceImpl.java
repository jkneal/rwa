package edu.iu.es.ebs.rwa.service.impl;

import edu.iu.es.ebs.rwa.domain.AttestationText;
import edu.iu.es.ebs.rwa.repositories.AttestationTextRepository;
import edu.iu.es.ebs.rwa.service.AttestationService;
import io.micrometer.core.instrument.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class AttestationServiceImpl implements AttestationService {

    @Autowired
    AttestationTextRepository attestationTextRepository;

    @Override
    public AttestationText getCurrentAttestation() {
        return attestationTextRepository.getCurrent(LocalDate.now());
    }

    @Override
    public List<AttestationText> getFutureAttestations() {
        return attestationTextRepository.getFuture(LocalDate.now());
    }

    @Override
    public List<String> saveAttestation(AttestationText attestationText) {
        List<String> errors = new ArrayList<>();

        if (attestationText.getEffectiveDate() == null) {
            errors.add("Effective date is required.");
        } else if (!attestationText.getEffectiveDate().isAfter(LocalDate.now())) {
            errors.add("Effective date is must be after today.");
        } else {
            AttestationText foundAttestationText = attestationTextRepository.getByEffectiveDate(attestationText.getEffectiveDate());
            if (foundAttestationText != null && !foundAttestationText.getId().equals(attestationText.getId())) {
                errors.add("Another record with the same effective date exists. Please either edit that record instead, or choose a different effective date.");
            }
        }

        if (StringUtils.isBlank(attestationText.getText())) {
            errors.add("Test is required");
        }

        if (errors.isEmpty()) {
            attestationTextRepository.save(attestationText);
        }

        return errors;
    }

}
