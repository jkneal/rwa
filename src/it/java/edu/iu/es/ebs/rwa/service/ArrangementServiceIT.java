package edu.iu.es.ebs.rwa.service;

import edu.iu.es.ebs.rwa.RwaConstants;
import edu.iu.es.ebs.rwa.domain.AdminArrangementDto;
import edu.iu.es.ebs.rwa.service.impl.ArrangementServiceImpl;
import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(value = "classpath:/launchpad-base-config.properties")
class ArrangementServiceIT {

    @Autowired
    ArrangementService arrangementService;

    @Test
    void getArrangements() {
        Map<String, Object> searchParameters = new HashMap<>();
        searchParameters.put(RwaConstants.ArrangementSearchFields.CHART, "UA");
        searchParameters.put(RwaConstants.ArrangementSearchFields.ORG, List.of("ESOL"));
        List<AdminArrangementDto> completedArrangements = arrangementService.getArrangements(searchParameters);
        assertTrue(completedArrangements.size() > 0);

        AdminArrangementDto completedArrangement = completedArrangements.get(0);
        assertTrue(Arrays.asList(ArrangementServiceImpl.HYBRID, ArrangementServiceImpl.FULLY_REMOTE)
                .contains(completedArrangement.getRemoteWorkType()));
        assertEquals("UA", completedArrangement.getJobDepartmentChart());
        assertEquals("ESOL", completedArrangement.getJobDepartmentOrg());
        assertNotNull(completedArrangement.getName());
    }

    @Test
    void getArrangements_employeeId() {
        String value = "Ekanayake";
        HashMap<String, Object> testValue = new HashMap<>();
        testValue.put(RwaConstants.ArrangementSearchFields.EMPLID, "kekanaya");
        testValue.put(RwaConstants.ArrangementSearchFields.CHART, "UA");
        testValue.put(RwaConstants.ArrangementSearchFields.ORG, List.of("VPIT"));
        List<AdminArrangementDto> completedArrangements = arrangementService.getArrangements(testValue);
        assertTrue(completedArrangements.size() > 0);

        completedArrangements.forEach(completedArrangement ->
            assertTrue(StringUtils.containsIgnoreCase(completedArrangement.getName(), value))
        );

        testValue = new HashMap<>();
        testValue.put(RwaConstants.ArrangementSearchFields.EMPLID, "kekanaya");
        testValue.put(RwaConstants.ArrangementSearchFields.CHART, "UA");
        testValue.put(RwaConstants.ArrangementSearchFields.ORG, List.of("VPIT"));
        completedArrangements = arrangementService.getArrangements(testValue);
        assertTrue(completedArrangements.size() > 0);

        completedArrangements.forEach(completedArrangement ->
            assertTrue(StringUtils.containsIgnoreCase(completedArrangement.getName(), value))
        );

        testValue = new HashMap<>();
        testValue.put(RwaConstants.ArrangementSearchFields.EMPLID, "kekanaya");
        testValue.put(RwaConstants.ArrangementSearchFields.CHART, "UA");
        testValue.put(RwaConstants.ArrangementSearchFields.ORG, List.of("VPIT"));
        completedArrangements = arrangementService.getArrangements(testValue);
        assertTrue(completedArrangements.size() > 0);

        completedArrangements.forEach(completedArrangement ->
            assertTrue(StringUtils.containsIgnoreCase(completedArrangement.getName(), value))
        );
    }
}