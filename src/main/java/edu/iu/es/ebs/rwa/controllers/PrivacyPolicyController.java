package edu.iu.es.ebs.rwa.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Controller
public class PrivacyPolicyController {

    @Value("${privacy.api.url}")
    private String privacyApiUrl;

    @Value("${privacy.api.token}")
    private String privacyApiToken;

    @GetMapping("/privacyPolicy")
    public String getPrivacyPolicy(Model model) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Token " + privacyApiToken);
        HttpEntity<String> entity = new HttpEntity<>("parameters", headers);

        ResponseEntity<Map> response = restTemplate.exchange(
            privacyApiUrl,
            HttpMethod.GET,
            entity,
            Map.class
        );

        model.addAttribute("privacyNoticeText", response.getBody().get("privacy_notice_text"));

        return "privacyPolicy";
    }
}
