package edu.iu.es.ebs.rwa.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ForwardConfiguration implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/arrangement/**").setViewName("forward:/index.html");
        registry.addViewController("/admin/**").setViewName("forward:/index.html");
        registry.addViewController("/error").setViewName("forward:/index.html");
        registry.addViewController("/unauthorized").setViewName("forward:/index.html");
        registry.addViewController("/logout").setViewName("forward:/logout.html");
    }
}
