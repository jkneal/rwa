package edu.iu.es.ebs.rwa.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

import static edu.iu.es.ebs.rwa.RwaConstants.*;

@RestController
@RequestMapping("/api")
public class InfoController {

    @Value("${application.url}")
    private String rwaUrl;

    @Value("${analytics.tracking.id}")
    private String analyticsTrackingId;

    @Value("${rice.url}")
    private String riceUrl;

    @Autowired
    protected org.springframework.core.env.Environment environment;

    @RequestMapping("/env")
    public Map<String, Object> getEnvironmentAttributes() {
        Map<String, Object> ret = new HashMap<>();
        ret.put("rwaUrl", rwaUrl);
        ret.put("analyticsTrackingId", analyticsTrackingId);
        ret.put("riceUrl", riceUrl);

        String testEnvironment = "";
        String[] activeProfiles = environment.getActiveProfiles();
        for (String activeProfile: activeProfiles) {
            if (DEV_ENVIRONMENT_CODE.equals(activeProfile)) {
                testEnvironment = "Dev";
            } else if (UNT_ENVIRONMENT_CODE.equals(activeProfile)) {
                testEnvironment = "Unit";
            } else if (STG_ENVIRONMENT_CODE.equals(activeProfile)) {
                testEnvironment = "Stage";
            }
        }

        ret.put("testEnvironment", testEnvironment);
        return ret;
    }

}
