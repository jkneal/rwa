package edu.iu.es.ebs.rwa.configuration;

import edu.iu.es.ep.launchpad.auth.exception.PasswordGrantAuthorizationException;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRequest;
import org.springframework.http.MediaType;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.security.oauth2.client.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Configuration
public class BatchRestConfiguration implements InitializingBean {

    @Value("${uaa.rwa.system.username}")
    private String username;
    @Value("${uaa.rwa.system.password}")
    private String password;
    @Value("${spring.security.oauth2.client.registration.uaa.client-id}")
    private String clientId;
    @Value("${spring.security.oauth2.client.registration.uaa.client-secret}")
    private String clientSecret;
    @Value("${uaa.url}/oauth/token")
    private String tokenUri;
    @Autowired(required = false)
    OAuth2AuthorizationFailureHandler authorizationFailureHandler;

    private final RestTemplate passwordGrantRestTemplate;
    private final RestTemplate accessTokenRestTemplate;
    private final HttpHeaders httpHeaders = new HttpHeaders();
    private final MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();

    public BatchRestConfiguration(@Autowired RestTemplateBuilder restTemplateBuilder) {
        this.passwordGrantRestTemplate = restTemplateBuilder.build();
        this.accessTokenRestTemplate = restTemplateBuilder.build();
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        passwordGrantRestTemplate.setInterceptors(Collections.singletonList((HttpRequest request, byte[] body, ClientHttpRequestExecution execution) -> {
            HttpHeaders httpHeaders = request.getHeaders();
            Optional<String> accessToken = getAccessToken();
            if (accessToken.isPresent()) {
                httpHeaders.add(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken.get());
            }

            return execution.execute(request, body);
        }));
        httpHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        requestBody.add("grant_type", "password");
        requestBody.add("username", username);
        requestBody.add("password", password);
        requestBody.add("client_id", clientId);
        requestBody.add("client_secret", clientSecret);
    }

    @Bean
    @Deprecated
    @Profile("!integration-tests")
    public RestTemplate batchRestTemplate() {
        return passwordGrantRestTemplate;
    }

    private Optional<String> getAccessToken() {
        try {
            Object accessTokenResponse = this.accessTokenRestTemplate.postForEntity(tokenUri,
                    new HttpEntity<>(requestBody, httpHeaders),
                    Map.class).getBody().get("access_token");
            if (accessTokenResponse != null) {
                return Optional.of(accessTokenResponse.toString());
            } else {
                return Optional.empty();
            }
        } catch (HttpClientErrorException | HttpServerErrorException exception) {
            throw new PasswordGrantAuthorizationException("Failed to fetch access token using password grant flow", exception);
        }
    }

}
