package edu.iu.es.ebs.rwa.configuration;

import edu.iu.es.ebs.rwa.RwaConstants;
import edu.iu.es.ebs.rwa.controllers.WorkflowWebhookController;
import edu.iu.es.ebs.rwa.service.AuthorizationService;
import edu.iu.es.ep.launchpad.auth.PlatformAwareSecurityConfiguration;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.session.SessionManagementFilter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import static edu.iu.es.ebs.rwa.RwaConstants.AFT_USER;

@Configuration
@Order(SecurityProperties.BASIC_AUTH_ORDER - 2)
public class SecurityConfiguration extends PlatformAwareSecurityConfiguration {

    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;

    @Autowired
    private OAuth2AuthorizedClientService oAuth2AuthorizedClientService;

    @Autowired
    private AuthorizationService authorizationService;

    @Override
    public SecurityFilterChain configureSecurity(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests((requests) -> requests
                        .requestMatchers("/admin/arrangements", "/api/admin/arrangements/search").hasAnyRole(RwaConstants.Roles.ADMIN, RwaConstants.Roles.RWA_REVIEWER)
                        .requestMatchers("/admin/**", "/api/admin/**").hasAnyRole(RwaConstants.Roles.ADMIN)
                        .requestMatchers("/api/arrangement/employee/**").hasAnyRole(RwaConstants.Roles.FIREFORM_GET_ARRANGEMENTS)
                        .anyRequest().authenticated()
                )
                .addFilterBefore(new AuthenticationAftProcessingFilter(), SessionManagementFilter.class)
                .logout(logout ->
                        logout.logoutUrl("/doLogout").logoutSuccessUrl("/logout").permitAll().clearAuthentication(true)
                                .invalidateHttpSession(true).deleteCookies("SESSION")
                )
                .headers(header -> header.frameOptions(frame -> frame.disable()))
                .build();
    }

    @Bean
    @Order(1)
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .securityMatcher(WorkflowWebhookController.WEBHOOK_PATH, WorkflowWebhookController.WEBHOOK_PATH + "/*")
                .authorizeHttpRequests((requests) -> requests.anyRequest().hasAnyAuthority("ROLE_WEBHOOK"))
                .httpBasic(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();
    }

    public class AuthenticationAftProcessingFilter implements Filter {

        public void init(FilterConfig filterConfig) {
        }

        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
            this.doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
        }

        public void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
            Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
            if (currentAuth instanceof JwtAuthenticationToken jwtAuthenticationToken
                && StringUtils.equals(currentAuth.getName(), AFT_USER) && !authorizationService.isPrd()) {
                Jwt jwt = jwtAuthenticationToken.getToken();
                OAuth2User oAuth2User = new DefaultOAuth2User(currentAuth.getAuthorities(), jwt.getClaims(), "user_name");
                Authentication oauth = new OAuth2AuthenticationToken(oAuth2User, currentAuth.getAuthorities(),
                    "uaa");
                SecurityContextHolder.getContext().setAuthentication(oauth);

                ClientRegistration clientRegistration = clientRegistrationRepository.findByRegistrationId("uaa");
                OAuth2AccessToken oauth2AccessToken = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER, jwt.getTokenValue(), jwt.getIssuedAt(), jwt.getExpiresAt());
                OAuth2AuthorizedClient impersonatedClient = new OAuth2AuthorizedClient(clientRegistration, oauth.getName(), oauth2AccessToken);
                oAuth2AuthorizedClientService.saveAuthorizedClient(impersonatedClient, oauth);
            }

            chain.doFilter(request, response);
        }
    }

}
